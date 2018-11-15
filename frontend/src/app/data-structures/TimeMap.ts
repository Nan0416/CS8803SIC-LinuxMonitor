export class TimeMap<T>{
    period: number; //ms
    arr: number[]; // sorted by time
    data: Map<number, T>;
    constructor(period: number = 0){ // second
        this.period = period * 1000;
        this.arr = [];
        this.data = new Map();
    }
    getPeriod():number{
        return this.period;
    }
    print(){
        for(let i = 0; i < this.arr.length; i++){
            console.log(this.data.get(this.arr[i]));
        }
    }
    updatePeriod(period: number): void{
        this.period = period;
        if(this.period > 0 && this.arr.length > 0){
            while(this.arr[this.arr.length - 1] - this.arr[0] > this.period){
                this.data.delete(this.arr.shift());
            }
        }
    }
    getLatest():T{
        return this.data.get(this.arr[this.arr.length - 1]);
    }
    get(time: number): T{
        return this.data.get(time);
    }
    set(time: number, element: T): T{
        if(this.period > 0 && this.arr.length > 0){
            while(time - this.arr[0] > this.period){
                this.data.delete(this.arr.shift());
            }
        }
        // don't use binary search because of the assumption that most time are recent.
        // so just search from the back;
        let i = this.arr.length - 1;
        for(; i >= 0; i--){
            if(time >= this.arr[i]){
                break;
            }
        }
        this.arr.splice(i + 1, 0, time);
        this.data.set(time, element);
        return element;
    }
    // callback (index, time, element)
    forEach(callback): void{
        for(let i = 0; i < this.arr.length; i++){
            callback(i, this.arr[i], this.data.get(this.arr[i]));
        }
    }
}
