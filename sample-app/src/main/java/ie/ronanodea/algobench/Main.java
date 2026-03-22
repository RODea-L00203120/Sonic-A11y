package ie.ronanodea.algobench;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class Main {
    public static void main(String[] args) {
        try {
            // Check for help flag first
            if (args.length > 0 && (args[0].equals("-h") || args[0].equals("--help"))) {
                CommandLineParser.printHelp();
                return;
            }
            
            // If arguments provided, run CLI mode
            if (args.length > 0) {
                // Parse command line arguments
                BenchmarkConfig config = CommandLineParser.parseArgs(args);
                if (config == null) {
                    return; // Help was displayed
                }
                CommandLineParser.printConfiguration(config);
                
                // Run benchmarks with the configured settings
                BenchmarkRunner runner = new BenchmarkRunner(config);
                runner.runAllBenchmarks();
            } else {
                // No arguments - start web server
                System.out.println("\n🚀 Starting Algorithm Benchmark Web Server...");
                SpringApplication.run(Main.class, args);
                System.out.println("📊 Server running at http://localhost:8080");
                System.out.println("💚 Health check: http://localhost:8080/api/health\n");
            }
        } catch (Exception e) {
            System.err.println("Error: " + e.getMessage());
            CommandLineParser.printHelp();
        }
    }
}
// Demo change
// Demo change 2
// Demo change 3
// Demo change 4
