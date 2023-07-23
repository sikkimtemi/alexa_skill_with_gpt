const Alexa = require('ask-sdk-core');
const { Configuration, OpenAIApi } = require('openai');

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    handle(handlerInput) {
        const speakOutput = '私はAIチャットボットです。何でも聞いてください。';
        const slotToElicit = 'user_message';
        const intent = {
            name: 'ChatBotIntent',
            confirmationStatus: 'NONE',
            slots: {
                user_message: {
                    name: 'user_message',
                    confirmationStatus: 'NONE',
                    value: ''
                }
            }
        };

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt('なにか話しかけてください。')
            .addElicitSlotDirective(slotToElicit, intent)
            .getResponse();
    }
};

const ChatBotIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'ChatBotIntent';
    },
    async handle(handlerInput) {
        const user_input = Alexa.getSlotValue(handlerInput.requestEnvelope, 'user_message');

        const configuration = new Configuration({
            apiKey: 'your-api-key',
        });
        const openai = new OpenAIApi(configuration);
        const template = "あなたは音声対話型チャットボットです。以下の制約にしたがって回答してください。\n\n制約:\n- ユーザーのメッセージに句読点を補ってから回答します\n- 簡潔な短い文章で話します\n- 質問の答えがわからない場合は「わかりません」と答えます";
        const messages = [
            {"role": "system", "content": template},
            {"role": "user", "content": user_input || "こんにちは"}
        ];
        const completion = await openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: messages
        });
        const speakOutput = completion.data.choices[0].message.content;

        const slotToElicit = 'user_message';
        const intent = {
            name: 'ChatBotIntent',
            confirmationStatus: 'NONE',
            slots: {
                user_message: {
                    name: 'user_message',
                    confirmationStatus: 'NONE',
                    value: ''
                }
            }
        };
        
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt('なにか話しかけてください。')
            .addElicitSlotDirective(slotToElicit, intent)
            .getResponse();
    }
};

const HelpIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const speakOutput = '自由に話しかけてみてください。';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent'
                || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        const speakOutput = 'さようなら。';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};
/* *
 * FallbackIntent triggers when a customer says something that doesn’t map to any intents in your skill
 * It must also be defined in the language model (if the locale supports it)
 * This handler can be safely added but will be ingnored in locales that do not support it yet 
 * */
const FallbackIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.FallbackIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'すみません、よくわかりません。';
        const reprompt = 'お助けできることは何かありますか？';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};
/* *
 * SessionEndedRequest notifies that a session was ended. This handler will be triggered when a currently open 
 * session is closed for one of the following reasons: 1) The user says "exit" or "quit". 2) The user does not 
 * respond or says something that does not match an intent defined in your voice model. 3) An error occurs 
 * */
const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        console.log(`~~~~ Session ended: ${JSON.stringify(handlerInput.requestEnvelope)}`);
        // Any cleanup logic goes here.
        return handlerInput.responseBuilder.getResponse(); // notice we send an empty response
    }
};
/* *
 * The intent reflector is used for interaction model testing and debugging.
 * It will simply repeat the intent the user said. You can create custom handlers for your intents 
 * by defining them above, then also adding them to the request handler chain below 
 * */
const IntentReflectorHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest';
    },
    handle(handlerInput) {
        const intentName = Alexa.getIntentName(handlerInput.requestEnvelope);
        const speakOutput = `あなたが呼び出したインテントはこちらです。${intentName}`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};
/**
 * Generic error handling to capture any syntax or routing errors. If you receive an error
 * stating the request handler chain is not found, you have not implemented a handler for
 * the intent being invoked or included it in the skill builder below 
 * */
const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        const speakOutput = '申し訳ありません。もう一度お試しください。';
        console.log(`~~~~ Error handled: ${JSON.stringify(error)}`);

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

/**
 * This handler acts as the entry point for your skill, routing all request and response
 * payloads to the handlers above. Make sure any new handlers or interceptors you've
 * defined are included below. The order matters - they're processed top to bottom 
 * */
exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        LaunchRequestHandler,
        ChatBotIntentHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        FallbackIntentHandler,
        SessionEndedRequestHandler,
        IntentReflectorHandler)
    .addErrorHandlers(
        ErrorHandler)
    .withCustomUserAgent('chapter04')
    .lambda();