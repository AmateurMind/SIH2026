// Request queue for OpenRouter API to handle rate limiting
let queue: Array<() => Promise<any>> = [];
let isProcessing = false;

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function processQueue() {
  if (isProcessing || queue.length === 0) return;
  
  isProcessing = true;
  
  while (queue.length > 0) {
    const request = queue.shift();
    if (request) {
      try {
        await request();
      } catch (error) {
        console.error('Queue request error:', error);
      }
      // Add a small delay between requests to avoid rate limiting
      await delay(1000);
    }
  }
  
  isProcessing = false;
}

export async function queuedOpenRouterRequest<T>(requestFn: () => Promise<T>): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    queue.push(async () => {
      try {
        const result = await requestFn();
        resolve(result);
      } catch (error) {
        reject(error);
      }
    });
    processQueue();
  });
}
