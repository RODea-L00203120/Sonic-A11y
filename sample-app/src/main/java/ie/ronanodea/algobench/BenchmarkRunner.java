package ie.ronanodea.algobench;

import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.ConcurrentHashMap;
import java.util.Map;
import java.util.function.Consumer;

public class BenchmarkRunner {
    private final Benchmarker benchmarker;
    private final BenchmarkConfig config;
    private final BenchmarkResultsPrinter printer;
    private final CSVExporter csvExporter;
    private final Map<String, Double> completionTimes = new ConcurrentHashMap<>();

    public BenchmarkRunner(BenchmarkConfig config) {
        this.benchmarker = new Benchmarker();
        this.config = config;
        this.printer = new BenchmarkResultsPrinter();
        this.csvExporter = new CSVExporter(config.getArraySizes());
    }

    public void runAllBenchmarks() {
        System.out.println("Starting benchmarks with multithreading...\n");
        long startTime = System.nanoTime();
        
        printer.printHeader(config.getArraySizes());

        // Create a thread pool with 5 threads (one per algorithm)
        ExecutorService executor = Executors.newFixedThreadPool(5);
        
        // Submit each sorting algorithm as a separate task
        executor.submit(() -> runSortingBenchmark("Bubble", BubbleSort::bubbleSort));
        executor.submit(() -> runSortingBenchmark("Selection", SelectionSort::selectionSort));
        executor.submit(() -> runSortingBenchmark("Insertion", InsertionSort::insertionSort));
        executor.submit(() -> runSortingBenchmark("Merge", MergeSort::mergeSort));
        executor.submit(() -> runSortingBenchmark("Bucket", BucketSort::bucketSort));
        
        // Shutdown executor and wait for all tasks to complete
        executor.shutdown();
        try {
            executor.awaitTermination(Long.MAX_VALUE, java.util.concurrent.TimeUnit.NANOSECONDS);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }

        // Print completion times after all tables, sorted from fastest to slowest
        System.out.println("\nAlgorithm completion times:");
        completionTimes.entrySet().stream()
            .sorted(Map.Entry.comparingByValue())
            .forEach(entry -> System.out.println(entry.getKey() + ": " + String.format("%.2f", entry.getValue()) + " seconds"));

        long endTime = System.nanoTime();
        double totalTimeSeconds = (endTime - startTime) / 1_000_000_000.0;
        printer.printTotalTime(totalTimeSeconds);
        
        // Export results to CSV
        csvExporter.exportToFile();
    }

    private void runSortingBenchmark(String algorithmName, Consumer<int[]> sortingAlgorithm) {
        long algoStartTime = System.currentTimeMillis();
        
        int[] sizes = config.getArraySizes();
        int reps = config.getRepetitions();
        int minValue = config.getMinValue();
        int maxValue = config.getMaxValue();
        
        double[] wallTimes = new double[sizes.length];

        for (int i = 0; i < sizes.length; i++) {
            wallTimes[i] = benchmarker.benchmarkWallTime(reps, sizes[i], sortingAlgorithm, minValue, maxValue);
        }

        long algoEndTime = System.currentTimeMillis();
        double duration = (algoEndTime - algoStartTime) / 1000.0;
        
        // Store completion time for later display
        completionTimes.put(algorithmName, duration);

        // Synchronize printing to prevent garbled output
        synchronized (printer) {
            printer.printAlgorithmResults(algorithmName, wallTimes, new double[sizes.length]);
        }
        
        // Synchronize CSV additions
        synchronized (csvExporter) {
            csvExporter.addResult(algorithmName, wallTimes);
        }
    }}