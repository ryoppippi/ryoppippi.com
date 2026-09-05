import type { Plugin, ViteDevServer } from 'vite';

type StaticSiteDevelopmentModule = {
	configureStaticSiteDevelopmentServer: (server: ViteDevServer) => Promise<void>;
};

/**
 * Connects the remaining development middleware to Vite.
 *
 * @returns The Vite plugin that connects site rendering to Vite.
 */
export function createStaticSiteDevelopmentPlugin(): Plugin {
	return {
		name: 'ryoppippi-static-site',
		apply: (_config, { mode }) => mode !== 'test',
		applyToEnvironment: (environment) => environment.name === 'client',
		async configureServer(server) {
			const { configureStaticSiteDevelopmentServer } = (await server.ssrLoadModule(
				'/src/dev-server/index.ts',
			)) as StaticSiteDevelopmentModule;
			await configureStaticSiteDevelopmentServer(server);
		},
	};
}
