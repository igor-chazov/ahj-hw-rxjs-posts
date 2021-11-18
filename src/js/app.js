import Posts from './Posts/Posts';

export default function main() {
  const posts = new Posts();
  posts.getDataAndRefresh();
}
