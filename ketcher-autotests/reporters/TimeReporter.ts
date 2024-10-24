import { Reporter, TestCase, TestResult } from '@playwright/test/reporter';

class TimeReporter implements Reporter {
  public results: { title: string; duration: number; status: string }[] = [];
  onTestBegin(_test: TestCase, result: TestResult) {
    result.startTime = new Date();
  }

  onTestEnd(test: TestCase, result: TestResult) {
    const endTime = new Date().getTime();
    const duration = endTime - result.startTime.getTime();
    this.results.push({
      title: test.titlePath().join(' > '),
      duration,
      status: result.status,
    });
  }

  onEnd() {
    // Sort tests by execution time
    this.results.sort((a, b) => a.duration - b.duration);

    console.log('\nTest Execution Times (sorted):');
    this.results.forEach((result) => {
      console.log(
        // eslint-disable-next-line no-magic-numbers
        `${result.title}: ${result.duration / 1000}ms (${result.status})`,
      );
    });
  }
}

module.exports = TimeReporter;
