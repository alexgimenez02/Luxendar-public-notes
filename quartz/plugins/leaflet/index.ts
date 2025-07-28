// src/plugins/leaflet.ts

import type { QuartzTransformerPlugin } from "../types";
import { visit } from "unist-util-visit";

const leafletPlugin: QuartzTransformerPlugin = () => {
  return {
    name: "leafletPlugin",

    async transform(content: any, _opts: any) {
      visit(content, "code", (node: any, index, parent) => {
        if (node.lang === "leaflet") {
          const lines = node.value.split("\n");
          const config = Object.fromEntries(
            lines.map((line: any) => {
              const [key, value] = line.split(":").map((s: string) => s.trim());
              return [key, isNaN(+value) ? value : +value];
            })
          );

          const mapId = `leaflet-map-${Math.random().toString(36).slice(2, 10)}`;

          const html = `
            <div id="${mapId}" class="leaflet-container" style="height: 400px; margin: 1em 0;"></div>
            <script type="module">
              import L from "leaflet";

              const map = L.map("${mapId}").setView([${config.lat || 0}, ${config.lng || 0}], ${config.zoom || 2});
              L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; OpenStreetMap contributors'
              }).addTo(map);

              ${config.marker ? `L.marker([${config.lat}, ${config.lng}]).addTo(map);` : ""}
            </script>
          `;

          parent?.children?.splice(index!, 1, {
            type: "html",
            value: html
          });
        }
      });

      return content;
    },
  };
};

export default leafletPlugin;
