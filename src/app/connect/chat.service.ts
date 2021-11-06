import { User } from './../user/login-page/user';
import { GoogleSigninDirective } from './../user/google-signin.directive';
import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/compat/firestore';
import { map, switchMap } from 'rxjs/operators';
import { chatCredential } from './chat.model';
import { arrayUnion } from 'firebase/firestore'
import { combineLatest, Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  constructor(private auth : AngularFireAuth, private db : AngularFirestore, private gService : GoogleSigninDirective) { }

  /**
   * get chat session data from firebase
   */
  getChatRoomReq(){
    return this.auth.authState.pipe(switchMap(user=>{
      if (user){
        return this.db.collection<chatCredential>('chats',ref =>
      ref.where('connStatus', '==', false)).valueChanges({idField : 'id'}); //.orderBy('createdAt')
      } else {
        return [];
      }}));

  }

  getMySession(){
    return this.auth.authState.pipe(switchMap(user=>{
      if (user){
        return this.db.collection<chatCredential>('chats',ref =>
      ref.where('members', 'array-contains', user.uid)).valueChanges({idField : 'id'});
      } else {
        return [];
      }}));
  }

  async acceptPatient(docId : string){
    const user = await this.gService.getUser();
    const data = {
      members: arrayUnion(user.uid),
      //dateAccept : Date.now(),
      connStatus: true
    } 
    return await this.db.doc(`chats/${docId}`).update(data);
  }

  getMsg(docId : string){
    return this.db.collection<any>('chats')
      .doc(docId)
      .snapshotChanges()
      .pipe(
        map(doc => {
          return { id: doc.payload.id, ...doc.payload.data() };
        })
      );
  }

  async sendMessage(chatId: any, content: any) {
    const { uid } = await this.gService.getUser();

    const data = {
      uid,
      content,
      createdAt: Date.now()
    };

    if (uid) {
      const ref = this.db.collection('chats').doc(chatId);
      return ref.update({
        msg: arrayUnion(data)
      });
    }
  }
  
  getDispName(uid :string){
    return this.db.doc<User>(`users/${uid}`).valueChanges();
  }  

  joinUsers(chat$: Observable<any>) {
    type jKey = {
      [key: string] : any;
    } 
    let chat: { msg: any[]; };
    const joinKeys : jKey = {};

    return chat$.pipe(
      switchMap(c => {
        // Unique User IDs
        chat = c;
        const uids = Array.from(new Set(c.msg.map((v: { uid: string; }) => v.uid)));

        // Firestore User Doc Reads
        const userDocs = uids.map(u =>
          this.db.doc(`users/${u}`).valueChanges()
        );

        return userDocs.length ? combineLatest(userDocs) : of([]);
      }),
      map(arr => {
        arr.forEach(v => (joinKeys[(<any>v).uid] = v));
        chat.msg = chat.msg.map(v => {
          return { ...v, user: joinKeys[v.uid] };
        });

        return chat;
      })
    );
  }

}