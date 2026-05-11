import chalk from "chalk";
import Table from "cli-table3";

const theme = {
  title: chalk.cyan.bold,
  header: chalk.blue.bold,
  year: chalk.yellow,
  author: chalk.green,
};

export function formatOutput(data: any, json?: boolean) {
  console.log("UPDATED FORMATTER RUNNING");
  if (json) {
    console.log(JSON.stringify(data, null, 2));
    return;
  }

  console.log();

  if (Array.isArray(data)) {
    const table = new Table({
      head: [
        theme.header("Title"),
        theme.header("Year"),
        theme.header("Author"),
      ],
      colWidths: [45, 10, 35],
      wordWrap: true,
    });

    data.forEach((item) => {
      const authors = Array.isArray(item.authors)
        ? item.authors.join(", ")
        : item.author || "-";

      table.push([
        item.title,
        item.year ? theme.year(String(item.year)) : "-",
        theme.author(authors),
      ]);
    });

    console.log(theme.title("📚 Books\n"));
    console.log(table.toString());
    console.log();

    return;
  }

  console.log(theme.title("📖 Summary\n"));
  console.log(chalk.white(data.title));

  if (data.author) {
    console.log(chalk.gray(data.author));
  }

  if (data.year) {
    console.log(chalk.gray(String(data.year)));
  }

  console.log();

  if (data.description) {
    console.log(chalk.gray(data.description));
    console.log();
  }

  console.log(data.summary);
  console.log();
}