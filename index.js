import { GoogleGenAI, Type } from '@google/genai';
import 'dotenv/config';
import readlineSync from "readline-sync";

// Initialize the SDK
const ai = new GoogleGenAI({});

// 1. Tool Functions
async function getcrypto({ coin }) {
    try {
        const response = await fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=inr&ids=${coin}`);
        const data = await response.json();
        // CoinGecko returns an array. We return the first item to keep the response clean for Gemini.
        return data[0] || { error: `Could not find data for ${coin}` };
    } catch (error) {
        return { error: "Failed to connect to CoinGecko API." };
    }
}

async function weathertool({ city }) {
    try {
        const response = await fetch(`http://api.weatherapi.com/v1/current.json?key=e75f9454fe2b429db3b93427261602&q=${city}&aqi=no`);
        const data = await response.json();
        return data;
    } catch (error) {
         return { error: "Failed to connect to Weather API." };
    }
}

// 2. Tool Declarations
const cryptoinfo = {
    name: "getcrypto",
    description: "It helps to give current information about the cryptocurrency like bitcoin, solana etc.",
    parameters: {
        type: Type.OBJECT,
        properties: {
            coin: {
                type: Type.STRING,
                description: "It will be the name of the cryptocurrency like bitcoin, solana etc."
            }
        },
        required: ['coin']
    }
}

const weatherinfo = {
    name: "weathertool",
    description: "It helps us to find the information about weather in a city like london, mumbai etc.",
    parameters: {
        type: Type.OBJECT,
        properties: {
            city: {
                type: Type.STRING,
                description: "It will be the name of city for which we want the weather information like london, mumbai etc."
            }
        },
        required: ['city']
    }
}

const tools = [{
    functionDeclarations: [cryptoinfo, weatherinfo]
}];

const toolFunctions = {
    "getcrypto": getcrypto,
    "weathertool": weathertool
}

// 3. Conversation State
let History = [];

// 4. Agent Logic
async function runAgent() {
    while (true) {
        try {
            const result = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: History,
                config: { tools },
            });

            // Handle Function Calls
            if (result.functionCalls && result.functionCalls.length > 0) {
                const functionCall = result.functionCalls[0];
                const { name, args } = functionCall;
                
                // Execute the correct tool
                const response = await toolFunctions[name](args);

                // Push Model's request to call the function
                History.push({
                    role: "model",
                    parts: [{ functionCall: functionCall }],
                });

                // Push User's (System's) response containing the API data
                History.push({
                    role: "user",
                    parts: [{
                        functionResponse: {
                            name: functionCall.name,
                            response: { result: response },
                        }
                    }],
                });

            } else {
                // Handle Standard Text Response
                // Fallback to a default string if text is empty to prevent the 400 error
                const reply = result.text || "I successfully processed that, but have nothing else to say.";
                
                History.push({
                    role: 'model',
                    parts: [{ text: reply }]
                });
                
                console.log(`\nBot: ${reply}\n`);
                break; // Break the while loop to ask the user the next question
            }

        } catch (error) {
            // SAFETY NET: If an error like ECONNRESET or a 400 happens, we MUST
            // remove the last message from History so it doesn't corrupt future turns.
            if (History.length > 0) {
                History.pop(); 
            }
            console.error("\n[Error communicating with Gemini]:", error.message);
            console.log("Please try asking your question again.\n");
            break; 
        }
    }
}

// 5. Main Chat Loop
console.log("Hello! I'm a bot that can give you information about cryptocurrency and weather.");

// Using top-level await (requires "type": "module" in package.json)
while (true) {
    const question = readlineSync.question("Ask me anything : ");
    
    if (question.toLowerCase() === 'exit') {
        console.log("Goodbye!");
        break;
    }

    History.push({
        role: "user",
        parts: [{ text: question }]
    });

    await runAgent();
}