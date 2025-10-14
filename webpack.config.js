const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  mode: 'production',
  entry: {
    popup: './src/popup/index.jsx',
    dashboard: './src/dashboard/index.jsx',
    content: './src/content/content.js',
    background: './src/background/background.js'
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    clean: true,
    // Disable eval-based source maps for CSP compliance
    devtoolModuleFilenameTemplate: 'webpack://[namespace]/[resource-path]?[loaders]'
  },
  devtool: 'cheap-source-map', // Use CSP-compliant source maps
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react']
          }
        }
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader',
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                plugins: [
                  require('tailwindcss'),
                  require('autoprefixer')
                ]
              }
            }
          }
        ]
      },
      {
        test: /\.wasm$/,
        type: 'asset/resource',
        generator: {
          filename: '[name][ext]'
        }
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.jsx'],
    fallback: {
      'fs': false,
      'path': false,
      'crypto': false
    }
  },
  optimization: {
    // Disable code splitting for Chrome Extension compatibility
    runtimeChunk: false,
    splitChunks: false,
    minimize: true,
    minimizer: [
      // Use Terser with safe settings for Chrome Extensions
      new TerserPlugin({
        terserOptions: {
          compress: {
            // Disable eval and Function constructor
            unsafe: false,
            unsafe_comps: false,
            unsafe_Function: false,
            unsafe_math: false,
            unsafe_proto: false,
            unsafe_regexp: false,
            unsafe_undefined: false
          },
          mangle: true,
          output: {
            comments: false
          }
        }
      })
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/popup/popup.html',
      filename: 'popup.html',
      chunks: ['popup'],
      inject: 'body'
    }),
    new HtmlWebpackPlugin({
      template: './src/dashboard/dashboard.html',
      filename: 'dashboard.html',
      chunks: ['dashboard'],
      inject: 'body',
      // Add CSP meta tag for dashboard
      meta: {
        'Content-Security-Policy': {
          'http-equiv': 'Content-Security-Policy',
          content: "script-src 'self'; object-src 'self'"
        }
      }
    }),
    new CopyPlugin({
      patterns: [
        { from: 'manifest.json', to: 'manifest.json' },
        { from: 'src/content/content.css', to: 'content.css' },
        { from: 'assets', to: 'assets', noErrorOnMissing: true },
        // Copy sql.js wasm file
        { 
          from: 'node_modules/sql.js/dist/sql-wasm.wasm', 
          to: 'sql-wasm.wasm' 
        }
      ]
    })
  ]
};
