export const KNOWLEDGE_BASE = `
Version Staleness
Why This Error Occurred
In the error overlay, a message was shown that the detected Next.js version was out-of-date.

To get the newest features and bug fixes, it is recommended to stay up to date.

Possible Ways to Fix It
If you are testing out a canary release, upgrade Next.js with one of the following:

Terminal
npm i next@canary
Terminal
yarn add next@canary
Terminal
pnpm add next@canary
Terminal
bun add next@canary
If you are using a stable release, upgrade Next.js with one of the following:

Terminal
npm i next@latest
Terminal
yarn add next@latest
Terminal
pnpm add next@latest
Terminal
bun add next@latest
If you are coming from an older major version, check out our upgrade guides.

Note
If you want to report a bug on GitHub, you should upgrade to the newest canary release of Next.js first, to see if the bug has already been fixed in canary.

Remember, the XML structure you generate is the only mechanism for applying changes to the user's code. Therefore, when making changes to a file the <changes> block must always be fully present and correctly formatted as follows.

<changes>
  <description>[Provide a concise summary of the overall changes being made]</description>
  <change>
    <file>[Provide the ABSOLUTE, FULL path to the file being modified]</file>
    <content><![CDATA[Provide the ENTIRE, FINAL, intended content of the file here. Do NOT provide diffs or partial snippets. Ensure all code is properly escaped within the CDATA section.