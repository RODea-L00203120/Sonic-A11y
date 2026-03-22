package ie.ronanodea.algobench;

import java.util.Arrays;

public class CommandLineParser {
    
    /**
     * Parses command line arguments to create a BenchmarkConfig.
     * 
     * @param args Command line arguments
     * @return A BenchmarkConfig object based on the provided arguments
     * @throws IllegalArgumentException if arguments are invalid
     */
    public static BenchmarkConfig parseArgs(String[] args) {
        if (args.length > 0 && (args[0].equals("-h") || args[0].equals("--help"))) {
            printHelp();
            return null;
        }

        BenchmarkConfig.Builder builder = new BenchmarkConfig.Builder();
        
        for (int i = 0; i < args.length; i++) {
            switch (args[i]) {
                case "-r", "--repetitions":
                    if (i + 1 < args.length) {
                        try {
                            int reps = Integer.parseInt(args[++i]);
                            if (reps <= 0) {
                                throw new IllegalArgumentException("Repetitions must be a positive integer");
                            }
                            builder.repetitions(reps);
                        } catch (NumberFormatException e) {
                            throw new IllegalArgumentException("Invalid repetition value: " + args[i]);
                        }
                    } else {
                        throw new IllegalArgumentException("Missing value for repetitions argument");
                    }
                    break;
                case "-min", "--min-value":
                    if (i + 1 < args.length) {
                        try {
                            int min = Integer.parseInt(args[++i]);
                            // If max is already set, update range, otherwise only set min
                            if (i + 2 < args.length && (args[i + 1].equals("-max") || args[i + 1].equals("--max-value"))) {
                                int max = Integer.parseInt(args[i + 2]);
                                if (min >= max) {
                                    throw new IllegalArgumentException("Min value must be less than max value");
                                }
                                builder.randomRange(min, max);
                                i += 2; // Skip the next two arguments
                            } else {
                                builder.randomRange(min, 100); // Default max
                            }
                        } catch (NumberFormatException e) {
                            throw new IllegalArgumentException("Invalid minimum value: " + args[i]);
                        }
                    } else {
                        throw new IllegalArgumentException("Missing value for min-value argument");
                    }
                    break;
                case "-max", "--max-value":
                    if (i + 1 < args.length) {
                        try {
                            // Use default min (0) with specified max
                            int max = Integer.parseInt(args[++i]);
                            builder.randomRange(0, max);
                        } catch (NumberFormatException e) {
                            throw new IllegalArgumentException("Invalid maximum value: " + args[i]);
                        }
                    } else {
                        throw new IllegalArgumentException("Missing value for max-value argument");
                    }
                    break;
                case "-s", "--sizes":
                    if (i + 1 < args.length) {
                        try {
                            String[] sizeStrs = args[++i].split(",");
                            int[] sizes = new int[sizeStrs.length];
                            for (int j = 0; j < sizeStrs.length; j++) {
                                sizes[j] = Integer.parseInt(sizeStrs[j]);
                                if (sizes[j] <= 0) {
                                    throw new IllegalArgumentException("Array sizes must be positive integers");
                                }
                            }
                            builder.arraySizes(sizes);
                        } catch (NumberFormatException e) {
                            throw new IllegalArgumentException("Invalid array size value");
                        }
                    } else {
                        throw new IllegalArgumentException("Missing value for sizes argument");
                    }
                    break;
                default:
                    throw new IllegalArgumentException("Unknown argument: " + args[i]);
            }
        }
        
        return builder.build();
    }
    
    /**
     * Prints help information for command line arguments.
     */
    public static void printHelp() {
        System.out.println("Algorithm Benchmarking Tool");
        System.out.println("Usage: java -jar algobench.jar [options]");
        System.out.println("\nOptions:");
        System.out.println("  -r, --repetitions <num>  Number of repetitions for each benchmark (default: 10)");
        System.out.println("  -min, --min-value <num>  Minimum value for random arrays (default: 0)");
        System.out.println("  -max, --max-value <num>  Maximum value for random arrays (default: 100)");
        System.out.println("  -s, --sizes <s1,s2,...>  Comma-separated list of array sizes to benchmark");
        System.out.println("  -h, --help               Display this help message\n");
        System.out.println("Example:");
        System.out.println("  java -jar algobench.jar -r 5 -min -100 -max 100 -s 100,1000,10000");
    }
    
    /**
     * Prints the configuration details.
     * 
     * @param config The BenchmarkConfig to display
     */
    public static void printConfiguration(BenchmarkConfig config) {
        System.out.println("Running benchmarks with the following configuration:");
        System.out.println("Array sizes: " + Arrays.toString(config.getArraySizes()));
        System.out.println("Repetitions: " + config.getRepetitions());
        System.out.println("Random range: " + config.getMinValue() + " to " + config.getMaxValue());
        System.out.println();
    }
}