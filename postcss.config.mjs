const config = {
  plugins: {
    "postcss-pxtorem": {
      rootValue: 16,
      propList: [
        "font",
        "font-size",
        "line-height",
        "letter-spacing",
        "margin",
        "margin-top",
        "margin-right",
        "margin-bottom",
        "margin-left",
        "padding",
        "padding-top",
        "padding-right",
        "padding-bottom",
        "padding-left",
      ],
      exclude: /node_modules/i,
    },
  },
};

export default config;
