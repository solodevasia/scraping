import { CheerioCrawler, log, LogLevel } from "crawlee";

const crawler = new CheerioCrawler({
  minConcurrency: 10,
  maxConcurrency: 50,

  // On error, retry each page at most once.
  maxRequestRetries: 1,

  // Increase the timeout for processing of each page.
  requestHandlerTimeoutSecs: 30,

  // Limit to 10 requests per one crawl
  maxRequestsPerCrawl: 10,

  // This function will be called for each URL to crawl.
  // It accepts a single parameter, which is an object with options as:
  // https://crawlee.dev/api/cheerio-crawler/interface/CheerioCrawlerOptions#requestHandler
  // We use for demonstration only 2 of them:
  // - request: an instance of the Request class with information such as the URL that is being crawled and HTTP method
  // - $: the cheerio object containing parsed HTML
  async requestHandler({ pushData, request, $ }) {
    const data = [] as any[];
    $(
      "div.col-md-4.p-0.p-sm-2.mt-3.venue-card-item > a.m-0.p-0 > div.card.w-100"
    ).each((index, el) => {
      data.push({
        images: {
          url: $(el)
            .children("img.img-fluid.img-keep-aspect-ratio")
            .attr("src"),
          name: $(el)
            .children("img.img-fluid.img-keep-aspect-ratio")
            .attr("alt"),
        },
        name: $($(el).children()["1"])
          .find("div.card-body > div > h2.s14-500")
          .text(),
        fieldName: $($(el).children()["1"])
          .find("div.card-body >  h5.text-left.s20-500.turncate")
          .text(),
        rating: $($(el).children()["1"])
          .find("div.card-body >  h5.text-left.s14-400 > span")
          .text(),
        location: (() => {
          $($(el).children()["1"])
            .find("div.card-body >  h5.text-left.s14-400 > span")
            .remove();
          return $($(el).children()["1"])
            .find("div.card-body >  h5.text-left.s14-400")
            .text()
            .replace("   ·  ", "");
        })(),
        typeSports: $($(el).children()["1"])
          .find("div.card-body >  div.d-inline-block.s12-400")
          .text()
          .replace(/\s/g, "")
          .split("·"),
        cost: $($(el).children()["1"])
          .find("div.card-body >  p > span.s16-500")
          .text(),
        type: $($(el).children()["1"])
          .find("div.card-body >  p > span:last")
          .text()
          .replace("/", ""),
      });
    });
    pushData({
      data: data,
    });
  },

  // This function is called if the page processing failed more than maxRequestRetries + 1 times.
  failedRequestHandler({ request }) {
    log.debug(`Request ${request.url} failed twice.`);
  },
});

// Run the crawler and wait for it to finish.
await crawler.run(["https://ayo.co.id/venues"]);

log.debug("Crawler finished.");
