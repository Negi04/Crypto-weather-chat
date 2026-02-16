import { GoogleGenAI, Type } from '@google/genai';
import 'dotenv/config'
import {type} from 'os';
import readlineSync from "readline-sync"

const ai = new GoogleGenAI({});

async function getcrypto({coin}){
  
    const response = await fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=inr&ids=${coin}`);
    const data = await response.json();
    return data;
}
async function weathertool({city}){
    const response = await fetch(`http://api.weatherapi.com/v1/current.json?key=e75f9454fe2b429db3b93427261602&q=${city}&aqi=no`);
    const data = await response.json();
    return data;
}


const cryptoinfo = {
   name:"getcrypto",
   description:"It helps to give current information about the cryptocurrency like bitcoin, solana etc.",
   parameters:{
    type: Type.OBJECT,
    properties:{
        coin:{
            type:Type.STRING,
            description:"It will be the name of the cryptocurrency like bitcoin, solana etc."
        }
    },
    required:['coin'] 
   }
}

const weatherinfo = {
    name:"weathertool",
    description:"It helps us to find the information about weather in a city like london,mumbai etc.",
    parameters:{
        type:Type.OBJECT,
        properties:{
            city:{
            type:Type.STRING,
            description:"It will be the name of city for which we want the weather information like london, mumbai etc."
        }
    },
        required:['city']     
 }
}

const tools = [{
    functionDeclarations: [cryptoinfo,weatherinfo]
}];

const toolFunctions = {
    "getcrypto" : getcrypto,
    "weathertool" : weathertool
}


let History = [];


async function runAgent(){
    while(true){
    const result = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: History,
    config: { tools },
    });
    if (result.functionCalls && result.functionCalls.length > 0){
     
        const functionCall = result.functionCalls[0];
        const { name, args } = functionCall;
        const response = await toolFunctions[name](args);

        const functionResponsePart = {
        name: functionCall.name,
        response: {
        result: response,
      },
    };
     //Send the function response back to the model //  
      History.push({
      role: "model",
      parts: [{functionCall: functionCall}],
    });
    History.push({
      role: "user",
      parts: [{functionResponse: functionResponsePart}],
    });
    }else{
        History.push({
            role:'model',
            parts:[{text:result.text}]
        })
        console.log(result.text);
        break;
    }
    }
}

while(true){
    const question = readlineSync.question("Ask me anything : ");
     if(question=='exit'){
        break;
    }
    History.push({
    role:"user",
    parts:[{text:question}]    
})
    await runAgent();
}



