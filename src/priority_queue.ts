interface QueueItem
{
    key: number;
    message: Buffer;
}
class PriorityQueue
{
    private queue: QueueItem[];
    constructor() 
    {
        this.queue = [];
    }

    enqueue(item: QueueItem): void 
    {
        const index = this.findIndexToInsert(item);
        this.queue.splice(index, 0, item);
    }

    dequeue(): QueueItem | undefined 
    {
        return this.queue.shift();
    }
    
    peek(): QueueItem | undefined
    {
        return this.queue[0];
    }
    
    isEmpty(): boolean
    {
        return this.queue.length === 0;
    }

    size(): number
    {
        return this.queue.length;
    }

    private findIndexToInsert(item: QueueItem): number 
    {
        const keyToInsert = item.key;
        let index = 0;
        
        while(index < this.queue.length && keyToInsert > this.queue[index].key)
        {
            index++;
        }

        return index;
    }
    
}

export default PriorityQueue;