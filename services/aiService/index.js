import { azure } from '@ai-sdk/azure';
import { generateObject, generateText } from 'ai';
const generateAiResponseObject = async ({ system, content, schema, model = 'gpt-35-turbo-0613', retries = 3 }) => {
  let lastError;
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      if (!system || !content || !schema) {
        throw new Error('Missing required parameters: system, content, or schema');
      }

      // Ensure content is properly formatted as an array of message objects
      const messages = Array.isArray(content)
        ? content
        : [{ role: "user", content: content }];

      console.log(`AI object generation attempt ${attempt}/${retries}`);

      const completion = await generateObject({
        model: azure("gpt-4o-mini", {
          apiVersion: "2024-04-01-preview",
          structuredOutputs: false, // Disable strict validation for complex schemas
          downloadImages: true
        }),
        system,
        messages, // Pass the properly formatted messages array  
        schema,
        temperature: 0.5, // Increased temperature for better completion
        maxTokens: 16000, // Increased token limit for comprehensive output
        maxRetries: 2 // Built-in retry mechanism
      });

      if (!completion || !completion.object) {
        throw new Error('No object generated: AI response was empty or invalid');
      }

      console.log('AI object generation successful on attempt', attempt);
      return completion.object;
      
    } catch (error) {
      lastError = error;
      
      console.error(`AI Response Generation Error (attempt ${attempt}/${retries}):`, {
        message: error.message,
        stack: error.stack,
        model: model
      });
      
      // Enhanced error handling with more specific error messages
      if (error.message.includes('rate limit')) {
        console.log(`Rate limit hit, waiting before retry ${attempt}/${retries}...`);
        if (attempt < retries) {
          await new Promise(resolve => setTimeout(resolve, 2000 * attempt)); // Exponential backoff
          continue;
        }
        throw new Error('Rate limit exceeded. Please try again later.');
      } else if (error.message.includes('auth')) {
        throw new Error('Authentication error with Azure AI service.');
      } else if (error.message.includes('token')) {
        console.error('Token limit exceeded, cannot retry');
        throw new Error(`Token limit exceeded: ${error.message}`);
      }
      
      // For schema validation errors or generic failures, retry with backoff
      if (attempt < retries) {
        const waitTime = 1000 * attempt;
        console.log(`Retrying in ${waitTime}ms... (attempt ${attempt}/${retries})`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }
    }
  }
  
  // All retries exhausted
  console.error('All retry attempts exhausted');
  
  if (lastError?.message?.includes('schema')) {
    throw new Error(`Schema validation failed after ${retries} attempts: The AI response did not match the expected schema structure. This may be due to schema complexity or content length. ${lastError.message}`);
  } else if (lastError?.message?.includes('No object generated')) {
    throw new Error(`No object generated after ${retries} attempts: AI response did not match schema. Try simplifying the analysis requirements.`);
  }

  // Re-throw with more detailed error message
  throw new Error(`Failed to generate AI response after ${retries} attempts: ${lastError?.message || 'Unknown error'}`);
}

const generateAiResponseMarkdown = async ({ system, content }) => {
  try {
    if (!system || !content) {
      throw new Error('Missing required parameters: system or content');
    }

    // Ensure content is properly formatted as an array of message objects
    const messages = Array.isArray(content)
      ? content
      : [{ role: "user", content: content }];

    const completion = await generateText({
      model: azure("gpt-4o-mini", {
        apiVersion: "2024-04-01-preview"
      }),
      system,
      messages,
      max_tokens: 1500,
      temperature: 0.7
    });

    if (!completion) {
      throw new Error('Failed to generate AI response markdown');
    }

    return {
      text: completion.text,
      // Add any additional processing or metadata here if needed
    };
  } catch (error) {
    console.error('AI Response Generation Error:', error);
    throw new Error(`Failed to generate AI response: ${error.message}`);
  }
}

export { generateAiResponseObject, generateAiResponseMarkdown }

