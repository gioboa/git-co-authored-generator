import { component$ } from "@qwik.dev/core";
import { useDocumentHead, useLocation } from "@qwik.dev/router";

export const DEFAULT_METADATA_URL = "git-co-authored-generator.pages.dev";
export const DEFAULT_METADATA_TITLE =
  "Git co-author(s) commit message generator";
export const DEFAULT_METADATA_DESCRIPTION =
  "Creating Git/GitHub commit message to add co-author(s) is a mess. Add the users below and I will automatically generate the snippet for you.";
export const DEFAULT_METADATA_IMAGE =
  "https://git-co-authored-generator.pages.dev/images/social_image.png";

export const generateDocumentHead = (
  url = DEFAULT_METADATA_URL,
  title = DEFAULT_METADATA_TITLE,
  description = DEFAULT_METADATA_DESCRIPTION,
  image = DEFAULT_METADATA_IMAGE,
) => {
  const OG_METATAGS = [
    { property: "og:type", content: "website" },
    { property: "og:url", content: url },
    { property: "og:title", content: title },
    {
      property: "og:description",
      content: description,
    },
    {
      property: "og:image",
      content: image ? image + "?w=800&h=800&format=webp" : undefined,
    },
  ];
  const TWITTER_METATAGS = [
    { property: "twitter:card", content: "summary_large_image" },
    { property: "twitter:url", content: url },
    { property: "twitter:title", content: title },
    {
      property: "twitter:description",
      content: description,
    },
    {
      property: "twitter:image",
      content: image ? image + "?w=800&h=800&format=webp" : undefined,
    },
  ];
  return { title, meta: [...OG_METATAGS, ...TWITTER_METATAGS] };
};

/**
 * The RouterHead component is placed inside of the document `<head>` element.
 */
export const RouterHead = component$(() => {
  const documentHead = useDocumentHead();
  const head =
    documentHead.meta.length > 0
      ? documentHead
      : { ...documentHead, ...generateDocumentHead() };
  const loc = useLocation();

  return (
    <>
      <title>{head.title}</title>

      <link rel="canonical" href={loc.url.href} />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <link rel="icon" type="image/svg+xml" href="/favicon.svg" />

      {head.meta.map((m, key) => (
        <meta key={key} {...m} />
      ))}

      {head.links.map((l) => (
        <link key={l.key} {...l} />
      ))}

      {head.styles.map((s) => (
        <style key={s.key} {...s.props} dangerouslySetInnerHTML={s.style} />
      ))}
    </>
  );
});
