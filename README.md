# Crypto-weather-chat

# AI Agent with Tool Calling (Gemini 2.5 Flash)

A command-line AI agent built with Node.js that uses Google's Gemini 2.5 Flash model. This agent is capable of intelligent function calling (Tool Use) to fetch real-time data for cryptocurrency prices and weather updates.

## 🚀 Features

* **Conversational AI:** Maintains chat history for natural interactions.
* **Function Calling:** Automatically decides when to use external tools based on user queries.
* **Real-time Crypto Data:** Fetches live cryptocurrency prices using the CoinGecko API.
* **Real-time Weather:** Fetches current weather conditions for any city using the WeatherAPI.
* **Auto-Retry Logic:** Includes robust error handling for API rate limits (429) and server overloads (503).

## 🛠️ Tech Stack

* **Runtime:** Node.js
* **AI Model:** Google Gemini 2.0 Flash (`@google/genai`)
* **Dependencies:** `dotenv`, `readline-sync`

## 📋 Prerequisites

Before running this project, make sure you have the following installed:

* [Node.js](https://nodejs.org/) (v18 or higher)
* A Google Gemini API Key from [Google AI Studio](https://aistudio.google.com/)

## ⚙️ Installation

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/your-username/your-repo-name.git](https://github.com/your-username/your-repo-name.git)
    cd your-repo-name
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Configure Environment Variables:**
    Create a `.env` file in the root directory and add your API key:
    ```env
    GEMINI_API_KEY=your_actual_api_key_here
    ```

## 🏃‍♂️ Usage

Run the agent using the following command:

```bash
node index.js