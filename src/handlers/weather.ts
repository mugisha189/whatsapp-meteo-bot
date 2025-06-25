import { Message } from "whatsapp-web.js";
import * as cli from "../cli/ui";
import { getConfig } from "./ai-config";

const weatherKnowledgeBase = {
  weather: {
    current: {
      kigali: "Kigali is currently partly cloudy with 25°C and 70% humidity.",
      musanze: "Musanze is currently experiencing rain with 18°C and 80% humidity.",
      huye: "Huye is sunny with 27°C and mild wind.",
    },
    forecast: {
      kigali: [
        "Monday: Sunny, 27°C.",
        "Tuesday: Showers, 24°C.",
        "Wednesday: Thunderstorms, 22°C.",
      ],
      musanze: [
        "Monday: Rainy, 19°C.",
        "Tuesday: Cloudy, 20°C.",
        "Wednesday: Showers, 21°C.",
      ],
      huye: [
        "Monday: Sunny, 28°C.",
        "Tuesday: Partly cloudy, 26°C.",
        "Wednesday: Humid, 25°C.",
      ],
    },
  },
  tips: {
    agriculture: {
      general:
        "Ensure crops are protected from excessive rain. Use mulching to conserve soil moisture.",
      kigali:
        "In Kigali, consider planting vegetables like carrots and spinach after rain.",
    },
    health: {
      general:
        "Stay hydrated, avoid prolonged sun exposure, and protect against mosquito bites.",
      kigali:
        "Due to high humidity in Kigali, people with asthma should stay indoors when possible.",
    },
  },
};

export const handleWeatherMessage = async (
  message: Message,
  prompt: string
) => {
  try {
    cli.print(`[WeatherBot] Received weather-related prompt from ${message.from}: ${prompt}`);

    const payload = {
      model: "deepseek/deepseek-r1-0528:free",
      messages: [
        {
          role: "system",
          content: `You are a helpful assistant. Answer the user's question using this JSON knowledge base:\n\n${JSON.stringify(
            weatherKnowledgeBase,
            null,
            2
          )}\n\nMatch the user's language (Kinyarwanda, French, or English or Kiswahili). If it is something not in the given json use your knowledge to answer the question. If you don't know the answer, say "I don't know".`,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.4,
    };

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer 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`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.error("[WeatherBot] OpenRouter API error:", await response.text());
      message.reply("Failed to analyze your question. Please try again later.");
      return;
    }

    const result = await response.json();
    const reply = result.choices[0].message.content;

    cli.print(`[WeatherBot] Reply to ${message.from}: ${reply}`);
    message.reply(reply);
  } catch (error: any) {
    console.error("[WeatherBot] An error occurred:", error);
    message.reply("An error occurred while analyzing your weather question: " + error.message);
  }
};
