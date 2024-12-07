export interface Command {
  name: string;
  description: string;
  category: string;
}

export interface Suggestion {
  prompt: string;
  description: string;
}

// Common command suggestions
export const commonCommands: Command[] = [
  { name: 'ls', description: 'List directory contents', category: 'File System' },
  { name: 'cd', description: 'Change directory', category: 'File System' },
  { name: 'help', description: 'Display help information', category: 'Help' },
  // ... other basic commands ...
];

// Intelligent prompt suggestions
export const promptSuggestions: Suggestion[] = [
  // System-related queries
  { prompt: 'what is Universal OS', description: 'Learn about the Universal OS system' },
  { prompt: 'what is the current version', description: 'Check the system version' },
  { prompt: 'what is the purpose of Universal OS', description: 'Understand the system goals' },
  { prompt: 'what is the file system', description: 'Learn about file management' },
  
  // Feature queries
  { prompt: 'what is command prediction', description: 'Learn about smart suggestions' },
  { prompt: 'what is syntax highlighting', description: 'Understand code highlighting' },
  { prompt: 'what is auto-complete', description: 'Learn about command completion' },
  
  // Help queries
  { prompt: 'what is the best way to', description: 'Get recommendations for tasks' },
  { prompt: 'what is the difference between', description: 'Compare features or commands' },
  { prompt: 'what is available', description: 'See all available features' },
  
  // Task-specific queries
  { prompt: 'what is the process for', description: 'Learn about specific procedures' },
  { prompt: 'what is required to', description: 'Understand requirements' },
  { prompt: 'what is happening', description: 'Get system status' }
];

export function filterSuggestions(input: string): Suggestion[] {
  const lowercaseInput = input.toLowerCase().trim();
  
  // If input is empty, return no suggestions
  if (!lowercaseInput) return [];
  
  // Filter suggestions based on input
  return promptSuggestions.filter(suggestion => {
    const promptLower = suggestion.prompt.toLowerCase();
    
    // Check if the suggestion starts with the input
    if (promptLower.startsWith(lowercaseInput)) return true;
    
    // Check if any word in the suggestion starts with the last word of input
    const inputWords = lowercaseInput.split(' ');
    const lastWord = inputWords[inputWords.length - 1];
    const suggestionWords = promptLower.split(' ');
    
    return suggestionWords.some(word => word.startsWith(lastWord));
  }).slice(0, 5); // Limit to 5 suggestions
}

export function filterCommands(input: string): Command[] {
  const lowercaseInput = input.toLowerCase().trim();
  return commonCommands.filter(cmd => 
    cmd.name.toLowerCase().startsWith(lowercaseInput)
  );
} 