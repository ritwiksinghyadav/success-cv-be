import { azure } from '@ai-sdk/azure';
import { generateObject, generateText } from 'ai';
const generateAiResponseObject = async ({ system, content, schema, model = 'gpt-35-turbo-0613' }) => {
  try {
    if (!system || !content || !schema) {
      throw new Error('Missing required parameters: system, content, or schema');
    }

    // Ensure content is properly formatted as an array of message objects
    const messages = Array.isArray(content)
      ? content
      : [{ role: "user", content: content }];

    const completion = await generateObject({
      model: azure("gpt-4o-mini", {
        apiVersion: "2024-04-01-preview",
        structuredOutputs: true,
        downloadImages: true
      }),
      system,
      messages, // Pass the properly formatted messages array  
      schema,
      temperature: 0.3 // Lower temperature for more structured output
    });

    if (!completion || !completion.object) {
      throw new Error('No object generated: AI response was empty or invalid');
    }

    console.log('AI object generation successful');
    return completion.object;
  } catch (error) {
    console.error('AI Response Generation Error:', {
      message: error.message,
      stack: error.stack,
      model: model
    });
    
    // Enhanced error handling with more specific error messages
    if (error.message.includes('rate limit')) {
      throw new Error('Rate limit exceeded. Please try again later.');
    } else if (error.message.includes('auth')) {
      throw new Error('Authentication error with Azure AI service.');
    } else if (error.message.includes('schema')) {
      throw new Error(`Schema validation failed: ${error.message}`);
    } else if (error.message.includes('token')) {
      throw new Error(`Token limit exceeded: ${error.message}`);
    } else if (error.message.includes('No object generated')) {
      throw new Error(`No object generated: response did not match schema`);
    }

    // Re-throw with more detailed error message
    throw new Error(`Failed to generate AI response: ${error.message}`);
  }
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

