import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";

export default defineConfig({
  integrations: [
    starlight({
      title: "Effortless",
      logo: {
        light: "./src/assets/logo-light.svg",
        dark: "./src/assets/logo-dark.svg",
      },
      favicon: "/favicon.svg",
      customCss: ["./src/styles/custom.css"],
      social: {
        github: "https://github.com/kondaurovDev/effortless-aws",
      },
      components: {
        SocialIcons: "./src/components/HeaderLinks.astro",
      },
      sidebar: [
        {
          label: "Getting Started",
          items: [
            { label: "Why Effortless?", slug: "why-effortless" },
            { label: "Installation", slug: "installation" },
            { label: "Configuration", slug: "configuration" },
            { label: "CLI", slug: "cli" },
          ],
        },
        {
          label: "Guides",
          items: [
            { label: "HTTP API", slug: "use-cases/http-api" },
            { label: "Database", slug: "use-cases/database" },
            { label: "Website", slug: "use-cases/web-app" },
            { label: "Queue", slug: "use-cases/queue" },
          ],
        },
        {
          label: "Reference",
          items: [
            { label: "Handlers", slug: "handlers" },
            { label: "Architecture", slug: "architecture" },
          ],
        },
        {
          label: "Resources",
          items: [
            { label: "Why AWS?", slug: "why-aws" },
            { label: "Comparisons", slug: "comparisons" },
            { label: "Roadmap", slug: "roadmap" },
          ],
        },
      ],
    }),
  ],
});
