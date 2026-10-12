import chalk from 'chalk';
import { primaryAgent } from './agents/primaryAgent.js';

const task = `
  Research what a REST API is, then write a simple Express.js
  REST API with GET and POST routes for a todos list,
  then review the code for any issues.
`;

try {
  const result = await primaryAgent.invoke({
    messages: [{ role: 'user', content: task }],
  });

  console.log(chalk.bold.cyan('\n=== FINAL ANSWER ==='));
  console.log(result.messages.at(-1)?.content ?? '');

  const intermediateSteps = result.messages.flatMap((message) =>
    (message.tool_calls ?? []).map((call) => ({
      action: { tool: call.name, toolInput: call.args },
      observation:
        result.messages.find((candidate) => candidate.tool_call_id === call.id)
          ?.content ?? '',
    })),
  );

  console.log(chalk.bold.cyan('\n=== AGENT STEPS ==='));
  intermediateSteps.forEach((step, i) => {
    console.log(chalk.yellow(`Step ${i + 1}: ${step.action.tool}`));
    console.log(chalk.gray(`  Input:  ${JSON.stringify(step.action.toolInput)}`));
    console.log(chalk.gray(`  Output: ${String(step.observation).slice(0, 120)}...`));
  });
} catch (error) {
  if (
    typeof error === 'object' &&
    error !== null &&
    (('statusCode' in error && error.statusCode === 429) ||
      ('status' in error && error.status === 429))
  ) {
    console.error(
      chalk.bold.red('\nAn AI provider rate limit was reached (HTTP 429).'),
    );
    console.error(
      chalk.yellow(
        'The request was rejected due to API capacity. Wait before retrying, or check the usage and rate limits for the provider assigned to that agent. No agent result was produced.',
      ),
    );
  } else {
    throw error;
  }

  process.exitCode = 1;
}