import esbuild from 'esbuild';
    import fs from 'fs';
    import path from 'path';
    import yaml from 'yaml';

    // 创建 esbuild 插件：自动补全 .yml 后缀并把 YAML 编译为 JS 对象
    const yamlPlugin = {
      name: 'yaml-loader',
      setup(build) {
        // 1. 自动为 require('./locales/zh-CN') 补全 .yml 后缀
        build.onResolve({ filter: /\/locales\/[^.]+/ }, (args) => ({
          path: path.join(args.resolveDir, args.path + '.yml'),
        }));

        // 2. 读取并编译 .yml 内容为 JSON
        build.onLoad({ filter: /\.yml$/ }, async (args) => {
          const source = await fs.promises.readFile(args.path, 'utf8');
          const parsed = yaml.parse(source);
          return {
            contents: JSON.stringify(parsed),
            loader: 'json',
          };
        });
      },
    };

    // 执行 esbuild 构建
    await esbuild.build({
      entryPoints: ['src/index.ts'],
      bundle: true,
      platform: 'node',
      format: 'cjs',
      target: 'node16',
      outfile: 'lib/index.js',
      packages: 'external',
      plugins: [yamlPlugin],
    });

    console.log('✅ 打包成功！产物已生成至 lib/index.js');
