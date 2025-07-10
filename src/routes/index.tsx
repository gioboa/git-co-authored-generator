import { $, component$, useComputed$, useSignal } from "@qwik.dev/core";
import { GitHubLink } from "~/components/GitHubLink/GitHubLink";

export const cache: Record<string, any> = {};

const initialMessage = "-----\n";

export default component$(() => {
  const userSig = useSignal<string>("");
  const authorsSig = useSignal<any[]>([]);
  const copiedSig = useSignal<boolean>(false);
  const notFoundSig = useSignal<boolean>(false);
  const messageSig = useComputed$<string>(() => {
    let message = initialMessage;
    authorsSig.value.map((a) => {
      const author = cache[a];
      message += `\nCo-authored-by: ${author.name || author.login} <${author.id}+${author.login.toLowerCase()}@users.noreply.github.com>`;
    });
    return message;
  });

  const readUser = $(async (user: string) => {
    if (!authorsSig.value.find((author) => author === user)) {
      if (!cache[user]) {
        const response = await fetch(`https://api.github.com/users/${user}`);
        if (response.status === 200) {
          const gitHubUser = await response.json();
          cache[user] = gitHubUser;
        } else if (response.status === 404) {
          notFoundSig.value = true;
          setTimeout(() => {
            notFoundSig.value = false;
          }, 2_000);
        }
      }
      if (cache[user]) {
        authorsSig.value = [...authorsSig.value, user];
      }
    }
    userSig.value = "";
  });

  return (
    <div class="mt-8 flex flex-col items-center">
      <div class="w-full px-20">
        <GitHubLink />
        <label
          for="message"
          class="mx-auto mb-2 mt-4 block w-full text-center text-3xl"
        >
          Git co-author(s) commit message generator
        </label>

        <div>
          <label
            for="message"
            class="mb-4 mt-6 block text-lg font-medium text-gray-500 text-center"
          >
            Creating Git commit message to add co-author(s) is a mess.<br/>
            Add the users below and I will generate the snippet for you.
          </label>
          <div class="flex items-center border-b border-teal-500 py-2 mx-auto max-w-sm">
            <input
              class="mr-3 w-full appearance-none border-none bg-transparent px-2 py-1 leading-tight text-gray-700 focus:outline-none"
              type="text"
              placeholder="git handle (eg. gioboa)"
              bind:value={userSig}
              aria-label="Full name"
              onKeyPress$={(e) => {
                if (e.key === "Enter") {
                  readUser(userSig.value);
                }
              }}
            />
            <button
              class="flex-shrink-0 rounded border-4 border-teal-500 bg-teal-500 px-2 py-1 text-sm text-white hover:border-teal-700 hover:bg-teal-700"
              type="button"
              onClick$={() => readUser(userSig.value)}
            >
              Add
            </button>
          </div>
          <label
            for="message"
            class="my-2 block text-sm font-medium text-red-500"
          >
            {notFoundSig.value && "User not found."}&nbsp;
          </label>
        </div>

        <label
          for="message"
          class="mb-2 mt-8 block text-lg font-medium text-gray-500"
        >
          Git commit message{" "}
          <label
            for="message"
            class="mb-2 block text-sm font-medium text-gray-500"
            dangerouslySetInnerHTML={
              copiedSig.value ? "Message copied to the clipboard" : "&nbsp;"
            }
          />
        </label>

        <textarea
          id="message"
          readOnly
          class="block h-[150px] w-full resize-none rounded-lg border border-teal-500 bg-gray-50 p-2.5 text-[14px] text-gray-900 focus:border-blue-500 focus:ring-blue-500"
          dangerouslySetInnerHTML={messageSig.value}
          onClick$={async () => {
            await navigator.clipboard.writeText(messageSig.value);
            copiedSig.value = true;
            setTimeout(() => {
              copiedSig.value = false;
            }, 2_000);
          }}
        />
      </div>

      <div class="my-8 flex w-full flex-wrap justify-evenly">
        {authorsSig.value.map((a, key) => {
          const author = cache[a];
          return (
            <div key={key} class="mt-8">
              <div class="w-[200px] max-w-sm rounded-lg border border-teal-500 bg-white">
                <div class="flex flex-col items-center py-4">
                  <img
                    class="mb-3 h-24 w-24 rounded-full shadow-lg"
                    src={author.avatar_url}
                    alt={author.login}
                    width={100}
                    height={100}
                  />
                  <h5 class="mb-1 text-xl font-medium text-gray-900">
                    {author.login}
                  </h5>
                  <div class="mt-4 flex space-x-3 md:mt-6">
                    <a
                      href="#"
                      class="flex-shrink-0 rounded border-4 border-teal-500 bg-teal-500 px-2 py-1 text-sm text-white hover:border-teal-700 hover:bg-teal-700"
                      onClick$={() => {
                        authorsSig.value = authorsSig.value.filter(
                          (a) => a.toLowerCase() !== author.login.toLowerCase(),
                        );
                      }}
                    >
                      Remove
                    </a>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});
