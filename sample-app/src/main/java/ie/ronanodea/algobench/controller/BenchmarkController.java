package ie.ronanodea.algobench.controller;

import ie.ronanodea.algobench.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.ByteArrayOutputStream;
import java.io.PrintStream;
import java.util.*;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class BenchmarkController {

    private static final Logger log = LoggerFactory.getLogger(BenchmarkController.class);

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "UP");
        response.put("service", "Algorithm Benchmark API");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/error")
    public ResponseEntity<Map<String, String>> triggerError(
            @RequestParam(defaultValue = "Simulated application error") String message) {
        log.error("APPLICATION ERROR: {}", message);
        Map<String, String> response = new HashMap<>();
        response.put("status", "error_logged");
        response.put("message", message);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/benchmark")
    public ResponseEntity<Map<String, Object>> runBenchmark(
            @RequestParam(defaultValue = "10") int repetitions,
            @RequestParam(defaultValue = "0") int minValue,
            @RequestParam(defaultValue = "100") int maxValue,
            @RequestParam(defaultValue = "100,1000,10000") String sizes) {
        
        try {
            // Parse sizes
            int[] sizeArray = Arrays.stream(sizes.split(","))
                    .mapToInt(Integer::parseInt)
                    .toArray();
            
            // Create config with CORRECT parameter order: arraySizes, repetitions, minValue, maxValue
            BenchmarkConfig config = new BenchmarkConfig(sizeArray, repetitions, minValue, maxValue);
            
            // Capture console output
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            PrintStream ps = new PrintStream(baos);
            PrintStream old = System.out;
            System.setOut(ps);
            
            // Run benchmarks
            long startTime = System.currentTimeMillis();
            BenchmarkRunner runner = new BenchmarkRunner(config);
            runner.runAllBenchmarks();
            long endTime = System.currentTimeMillis();
            
            // Restore output
            System.out.flush();
            System.setOut(old);
            
            // Get captured output
            String consoleOutput = baos.toString();
            
            // Format response
            Map<String, Object> response = new HashMap<>();
            response.put("config", Map.of(
                "repetitions", repetitions,
                "minValue", minValue,
                "maxValue", maxValue,
                "sizes", sizeArray
            ));
            response.put("executionTime", (endTime - startTime) + "ms");
            response.put("consoleOutput", consoleOutput);
            response.put("timestamp", new Date().toString());
            response.put("status", "completed");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", e.getMessage());
            error.put("status", "failed");
            return ResponseEntity.badRequest().body(error);
        }
    }
}
