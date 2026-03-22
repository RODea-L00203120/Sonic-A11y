package ie.ronanodea.algobench;

public class BenchmarkResultsPrinter {
    private static final int ALGO_NAME_WIDTH = 15;
    private static final int COLUMN_WIDTH = 15;

    public void printHeader(int[] sizes) {
        System.out.println("Benchmark times measured in milliseconds (ms)");
        // System.out.println("Note: CPU time measurements may show 0.000000 for very quick operations due to measurement granularity");
        System.out.println();
        
        System.out.format("%-" + ALGO_NAME_WIDTH + "s", "Array Size:");
        for (int size : sizes) {
            System.out.format("%-" + COLUMN_WIDTH + "d", size);
        }
        System.out.println();
    }

    public void printAlgorithmResults(String algorithmName, double[] wallTimes, double[] cpuTimes) {
        // Print wall time row
        System.out.format("%-" + ALGO_NAME_WIDTH + "s", algorithmName + ":");
        for (double time : wallTimes) {
            System.out.format("%-" + COLUMN_WIDTH + ".6f", time);
        }
        System.out.println();

    }

    public void printTotalTime(double seconds) {
        System.out.println("\nReal world elapsed time: " + seconds + "s");
    }
}