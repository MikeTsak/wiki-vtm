import React from 'react';
import { renderToString } from 'react-dom/server';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

const md = `
<aside class="infobox">
  <div class="infobox-title">Athens Through Time</div>
  <img src="https://attlarp.gr/img/logo-insta.jpg" class="infobox-image" alt="ATT Logo" />
  <div class="infobox-caption">Official Chronicle of Athens</div>
  <div class="infobox-content">
    <table>
      <tbody>
        <tr><th>Setting</th><td>Vampire: The Masquerade</td></tr>
        <tr><th>System</th><td>V5 (5th Edition)</td></tr>
        <tr><th>Location</th><td>Athens, Greece</td></tr>
        <tr><th>Format</th><td>Live Action Roleplay (LARP)</td></tr>
        <tr><th>Website</th><td><a href="https://attlarp.gr/" target="_blank">attlarp.gr</a></td></tr>
      </tbody>
    </table>
  </div>
</aside>

Welcome to the **Erebus Wiki**
`;

try {
  const html = renderToString(
    React.createElement(ReactMarkdown, {
      remarkPlugins: [remarkGfm],
      rehypePlugins: [rehypeRaw]
    }, md)
  );
  console.log("Success:\n", html);
} catch (e) {
  console.error("Error:\n", e);
}
