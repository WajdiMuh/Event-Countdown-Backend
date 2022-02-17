class Event{
    constructor(title,date){
        this.title = title;
        this.date = date;
    }
    static fromJson(json) {
        return new Event(json['title'],json['date']);
    }
    toJson() {
        return {title:this.title,date:this.date};
    }
}
module.exports = {Event};