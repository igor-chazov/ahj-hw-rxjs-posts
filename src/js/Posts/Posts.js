import { forkJoin } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';
import { ajax } from 'rxjs/ajax';
import Post from './Post/Post';

export default class Posts {
  constructor() {
    this.element = null;
    this.els = {
      listPosts: null,
    };
    this.url = new URL('https://ahj-hw-rxjs-posts-backend.herokuapp.com/');

    this.init();
  }

  init() {
    this.element = document.querySelector('.posts');
    this.els.listPosts = this.element.querySelector('.list-posts');
    this.element.querySelector('.posts__btn-refresh')
      .addEventListener('click', this.onBtnRefreshClick.bind(this));
  }

  refresh(data) {
    const postsEls = data.reduce((acc, postData) => {
      acc.push(new Post(postData).element);
      return acc;
    }, []);

    this.els.listPosts.textContent = '';
    this.els.listPosts.append(...postsEls);
  }

  getDataAndRefresh() {
    ajax.getJSON(`${this.url}posts/latest`)
      .pipe(
        map(({ data }) => data
          .map((post) => ajax.getJSON(`${this.url}posts/${post.id}/comments/latest`)
            .pipe(
              // eslint-disable-next-line no-shadow
              map(({ data }) => ({
                ...post,
                comments: data,
              })),
            ))),
        switchMap((postObs) => forkJoin(postObs)),
      )
      .subscribe({
        next: (data) => this.refresh(data),
      });
  }

  onBtnRefreshClick() {
    fetch(`${this.url}posts/refresh`)
      .then((response) => response.json())
      .then((response) => {
        if (response.status === 'ok') this.getDataAndRefresh();
      })
      // eslint-disable-next-line no-console
      .catch((error) => console.log('Ошибка обновления:', error));
  }
}
