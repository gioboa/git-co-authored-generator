import { $, component$, useSignal } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';

export const cache: Record<string, any> = {};

export default component$(() => {
	const userSig = useSignal<string>('');
	const authorsSig = useSignal<any[]>([]);
	const readUser = $(async (user: string) => {
		if (!authorsSig.value.find((author) => author === user)) {
			if (!cache[user]) {
				const response = await fetch(`https://api.github.com/users/${user}`);
				if (response.status === 200) {
					const gitHubUser = await response.json();
					cache[user] = gitHubUser;
				}
			}
			if (cache[user]) {
				authorsSig.value = [...authorsSig.value, user];
			}
		}
	});

	return (
		<>
			<input type='text' bind:value={userSig} />
			<button onClick$={() => readUser(userSig.value)}>submit</button>
			{authorsSig.value.map((a, key) => (
				<div key={key}>{a}</div>
			))}
		</>
	);
});

export const head: DocumentHead = {
	title: 'Git Co-authored-by message generator',
	meta: [
		{
			name: 'description',
			content: 'Creating a Git commit with multiple authors, tool to automatically generate Git Co-authored-by message',
		},
	],
};
