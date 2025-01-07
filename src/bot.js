import puppeteer from "puppeteer";
import dotenv from "dotenv";
import { LIMIT } from "./constant.js";
dotenv.config();

export const bot = async (instagramId) => {
  const email = process.env.EMAIL;
  const pass = process.env.PASSWORD;

  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto("https://instagram.com");

  const username = await page.waitForSelector(
    `xpath///input[@aria-label="Phone number, username, or email"]`
  );
  await username.type(`${email}`, { delay: 100 });
  console.log("username typed");
  const password = await page.waitForSelector(
    `xpath///input[@aria-label="Password"]`
  );
  await password.type(`${pass}`, { delay: 100 });
  console.log("password typed");

  const signin = await page.waitForSelector(
    `xpath///button[@class=" _acan _acap _acas _aj1- _ap30"]`
  );
  await signin.click();
  console.log("signin button clicked");

  await page.waitForSelector(
    `xpath///div[@class="x1xgvd2v x1o5hw5a xaeubzz x1cy8zhl xvbhtw8 x9f619 x78zum5 xdt5ytf x1gvbg2u x1y1aw1k xn6708d xx6bls6 x1ye3gou"]`
  );
  console.log("signin done");
  await page.goto(`https://www.instagram.com/${instagramId}/`);
  console.log("navigation done");

  let x = 0;
  let scrape = true;

  page.on("response", async (response) => {
    if (response.url().includes("/graphql/query")) {
      const responseData = await response.json();
      const postsData =
        responseData.data.xdt_api__v1__feed__user_timeline_graphql_connection;
      if (responseData.data && postsData) {
        parser(postsData.edges);
        if (x == LIMIT || !postsData.page_info.has_next_page) {
          scrape = false;
        }
      }
    }
  });
  while (scrape) {
    await page.keyboard.press("ArrowDown");
  }
  await browser.close();
  console.log(posts);
  return posts;
};

const posts = [];

const parser = (data) => {
  for (const post of data) {
    const text = post.node.caption?.text.split(/[\s\n]+/);
    let hashtags = [];
    const caption = text
      .filter((word) => {
        if (!word.startsWith("#")) {
          return word;
        }
        hashtags.push(word);
      })
      .join(" ");
    const postData = {
      caption,
      hashtags,
      image_count: post.node.image_versions2?.candidates.length | 0,
      video_count: post.node.video_versions?.length | 0,
      comment_count: post.node.comment_count,
      like_count: post.node.like_count,
    };
    let type;
    if (postData.image_count === 1) {
      type = "static";
    } else if (postData.image_count > 1) {
      type = "carousel";
    } else {
      type = "reel";
    }
    postData.type = type;
    posts.push(postData);
  }
};
