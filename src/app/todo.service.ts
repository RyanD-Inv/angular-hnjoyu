import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';

export interface Todo {
  _id: number | string;
  text: string;
  complete: boolean;
}

@Injectable()
export class TodoService {
  private _todos = new BehaviorSubject<Todo[]>([]);
  private baseUrl = 'http://heroku-gitlab-env-prod-dep.herokuapp.com';
  private dataStore: { todos: Todo[] } = { todos: [] };
  readonly todos = this._todos.asObservable();

  constructor(private http: HttpClient) { }

  loadAll() {
    this.http.get<Todo[]>(`${this.baseUrl}/todos`).subscribe(data => {
      this.dataStore.todos = data;
      this._todos.next(Object.assign({}, this.dataStore).todos);
    }, error => console.log('Could not load todos.'));
  }

  load(id: number | string) {
    this.http.get<Todo>(`${this.baseUrl}/todos/${id}`).subscribe(data => {
      let notFound = true;

      this.dataStore.todos.forEach((item, index) => {
        if (item._id === data._id) {
          this.dataStore.todos[index] = data;
          notFound = false;
        }
      });

      if (notFound) {
        this.dataStore.todos.push(data);
      }

      this._todos.next(Object.assign({}, this.dataStore).todos);
    }, error => console.log('Could not load todo.'));
  }

  create(todo: Todo) {
    this.http.post<Todo>(`${this.baseUrl}/todos`, JSON.stringify(todo)).subscribe(data => {
      this.dataStore.todos.push(data);
      this._todos.next(Object.assign({}, this.dataStore).todos);
    }, error => console.log('Could not create todo.'));
  }

  update(todo: Todo) {
    this.http.put<Todo>(`${this.baseUrl}/todos/${todo._id}`, JSON.stringify(todo)).subscribe(data => {
      this.dataStore.todos.forEach((t, i) => {
        if (t._id === todo._id) { this.dataStore.todos[i] = data; }
      });

      this._todos.next(Object.assign({}, this.dataStore).todos);
    }, error => console.log('Could not update todo.'));
  }

  remove(todoId: number | string) {
    this.http.delete(`${this.baseUrl}/todos/${todoId}`).subscribe(response => {
      this.dataStore.todos.forEach((t, i) => {
        if (t._id === todoId) { this.dataStore.todos.splice(i, 1); }
      });

      this._todos.next(Object.assign({}, this.dataStore).todos);
    }, error => console.log('Could not delete todo.'));
  }
}