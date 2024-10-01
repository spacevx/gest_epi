//********** Imports **********//
import app from "./app";

const port = process.env.SERVER_PORT || 5500;
app.listen(port, () => {
  /* eslint-disable no-console */
  console.log(`Listening: http://localhost:${port}`);
  /* eslint-enable no-console */
});
