class Event{
    constructor(id,title,date){
        this.id = id;
        this.title = title;
        this.date = date;
    }
    static fromJson(json) {
        return new Event(json['id'],json['title'],json['date']);
    }
    toJson() {
        return {id:this.id,title:this.title,date:this.date};
    }
}
module.exports = {Event};