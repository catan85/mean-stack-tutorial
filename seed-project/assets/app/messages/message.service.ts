import { Message } from "./message.model";
import { Http, Response, Headers } from "@angular/http";
import { Injectable, EventEmitter } from "@angular/core";
import 'rxjs/Rx';
import { Observable } from "rxjs/Observable";

@Injectable()
export class MessageService {
    private messages: Message[] = [];

    constructor(private http: Http){}

    messageIsEdit = new EventEmitter<Message>();

    addMessage(message: Message) {
        const body = JSON.stringify(message);
        const headers = new Headers({'Content-type': 'application/json'});
        const token = localStorage.getItem('token') 
            ?   '?token=' + localStorage.getItem('token')
            :   '';

        return this.http.post('http://localhost:3000/message' + token, body, {headers: headers})
            .map((response: Response) => { 
                const result = response.json();
                const message = new Message(
                    result.obj.content,
                    result.obj.user.firstName, 
                    result.obj._id, 
                    result.obj.user._id);
                this.messages.push(message);
                return message;   
            })
                    // nel caso di errore si deve creare un Observable 
                    // manualmente mentre nel caso di risposta positiva 
                    // viene creato automaticamente
            .catch((error:Response) => Observable.throw(error.json()));
    }

    getMessages() {
        return this.http.get('http://localhost:3000/message')
            .map((response: Response) => {
                const messages = response.json().messages;
                let transformedMessages: Message[] = [];
                for (let message of messages){
                    transformedMessages.push(new Message(
                        message.content, 
                        message.user.firstName,
                        message._id, 
                        message.user._id));
                }
                this.messages = transformedMessages;
                return transformedMessages;
            })
            .catch((error:Response) => Observable.throw(error.json()));
    }


    editMessage(message: Message){
        this.messageIsEdit.emit(message);
    }

    updateMessage(message: Message){
        const body = JSON.stringify(message);
        const headers = new Headers({'Content-type': 'application/json'});
        const token = localStorage.getItem('token') 
            ?   '?token=' + localStorage.getItem('token')
            :   '';
        return this.http.patch('http://localhost:3000/message/' + message.messageId + token, body, {headers: headers})
            .map((response: Response) => { return response.json();})
            .catch((error:Response) => Observable.throw(error.json()));
        
    }

    deleteMessage(message: Message) {
        this.messages.splice(this.messages.indexOf(message), 1);
        
        const body = JSON.stringify(message);
        const headers = new Headers({'Content-type': 'application/json'});
        
        const token = localStorage.getItem('token') 
            ?   '?token=' + localStorage.getItem('token')
            :   '';

        return this.http.delete('http://localhost:3000/message/' + message.messageId + token)
            .map((response: Response) => { return response.json();})
            .catch((error:Response) => Observable.throw(error.json()));
       
    }
}