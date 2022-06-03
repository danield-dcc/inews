import styles from "./styles.module.scss";
import Head from "next/head";
import { getPrismicClient } from "../../services/prismic";
import { GetStaticProps } from "next";
import Prismic from "@prismicio/client";
import { RichText } from "prismic-dom";
import Link from "next/link";

interface Post {
  slug: string;
  title: string;
  excerpt: string;
  updatedAt: string;
}

interface PostsProps {
  posts: Post[];
}

export default function Posts({ posts }: PostsProps) {
  return (
    <>
      <Head>
        <title>Posts | Ignews</title>
      </Head>

      <main className={styles.container}>
        <div className={styles.posts}>
          {posts.map((post) => (
            <>
              <Link href={`posts/${post.slug}`}>
                <a key={post.slug}>
                  <time>{post.title}</time>
                  <strong>{post.title}</strong>
                  <p>{post.excerpt}</p>
                </a>
              </Link>
            </>
          ))}
        </div>
      </main>
    </>
  );
}

//deixando os dados estáticos para não exaurir o limite de banda
export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();

  const response = await prismic.query(
    [
      Prismic.predicates.at("document.type", "publication"), //Aqui publication
    ],
    {
      fetch: ["publication.title", "publication.content"],
      pageSize: 100,
    }
  );
  // console.log(JSON.stringify(response, null, 2));
  //sempre que possível formatar os dados antes de joga-los na tela, para que desta forma esse processo
  //ocorra apenas uma fez, poupando assim processamento
  const posts = response.results.map((post) => {
    return {
      slug: post.uid,
      //@ts-ignore
      title: RichText.asText(post.data.title),
      excerpt:
        //@ts-ignore
        post.data.content.find((content) => content.type === "paragraph")
          ?.text ?? "",
      updatedAt: new Date(post.last_publication_date).toLocaleString("pt-BR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }),
    };
  });

  return {
    props: { posts },
  };
};
