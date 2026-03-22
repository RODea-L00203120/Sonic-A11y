package ie.ronanodea.algobench;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;

import static org.junit.jupiter.api.Assertions.*;

class CommandLineParserTest {

    @Test
    @DisplayName("Test parser with no arguments (default config)")
    void testParseWithNoArgs() {
        String[] args = {};
        BenchmarkConfig config = CommandLineParser.parseArgs(args);
        
        // Should return a non-null config with defaults
        assertNotNull(config);
        assertNotNull(config.getArraySizes());
        assertTrue(config.getArraySizes().length > 0);
        assertEquals(10, config.getRepetitions()); // Default is 10
        assertEquals(0, config.getMinValue()); // Default min
        assertEquals(100, config.getMaxValue()); // Default max
    }
    
    @Test
    @DisplayName("Test parser with custom repetitions")
    void testParseWithCustomRepetitions() {
        String[] args = {"-r", "15"};
        BenchmarkConfig config = CommandLineParser.parseArgs(args);
        
        assertEquals(15, config.getRepetitions());
        // Other params should be default
        assertEquals(0, config.getMinValue());
        assertEquals(100, config.getMaxValue());
    }
    
    @Test
    @DisplayName("Test parser with custom array sizes")
    void testParseWithCustomArraySizes() {
        String[] args = {"-s", "10,100,1000"};
        BenchmarkConfig config = CommandLineParser.parseArgs(args);
        
        assertArrayEquals(new int[]{10, 100, 1000}, config.getArraySizes());
        // Other params should be default
        assertEquals(10, config.getRepetitions());
        assertEquals(0, config.getMinValue());
        assertEquals(100, config.getMaxValue());
    }
    
    @Test
    @DisplayName("Test parser with custom min and max values")
    void testParseWithCustomMinMax() {
        String[] args = {"-min", "-100", "-max", "100"};
        BenchmarkConfig config = CommandLineParser.parseArgs(args);
        
        assertEquals(-100, config.getMinValue());
        assertEquals(100, config.getMaxValue());
        // Other params should be default
        assertEquals(10, config.getRepetitions());
    }
    
    @Test
    @DisplayName("Test parser with all custom parameters")
    void testParseWithAllCustomParams() {
        String[] args = {"-r", "5", "-min", "-50", "-max", "50", "-s", "100,500,1000"};
        BenchmarkConfig config = CommandLineParser.parseArgs(args);
        
        assertEquals(5, config.getRepetitions());
        assertEquals(-50, config.getMinValue());
        assertEquals(50, config.getMaxValue());
        assertArrayEquals(new int[]{100, 500, 1000}, config.getArraySizes());
    }
    
    @Test
    @DisplayName("Test parser with long-form arguments")
    void testParseWithLongFormArgs() {
        String[] args = {"--repetitions", "5", "--min-value", "-50", "--max-value", "50", "--sizes", "100,500,1000"};
        BenchmarkConfig config = CommandLineParser.parseArgs(args);
        
        assertEquals(5, config.getRepetitions());
        assertEquals(-50, config.getMinValue());
        assertEquals(50, config.getMaxValue());
        assertArrayEquals(new int[]{100, 500, 1000}, config.getArraySizes());
    }
    
    @Test
    @DisplayName("Test parser with invalid repetition value")
    void testParseWithInvalidRepetition() {
        String[] args = {"-r", "abc"};
        
        Exception exception = assertThrows(IllegalArgumentException.class, () -> {
            CommandLineParser.parseArgs(args);
        });
        
        assertTrue(exception.getMessage().contains("Invalid repetition value"));
    }
    
    @Test
    @DisplayName("Test parser with negative repetition value")
    void testParseWithNegativeRepetition() {
        String[] args = {"-r", "-5"};
        
        Exception exception = assertThrows(IllegalArgumentException.class, () -> {
            CommandLineParser.parseArgs(args);
        });
        
        assertTrue(exception.getMessage().contains("Repetitions must be a positive integer"));
    }
    
    @Test
    @DisplayName("Test parser with missing argument value")
    void testParseWithMissingValue() {
        String[] args = {"-r"};
        
        Exception exception = assertThrows(IllegalArgumentException.class, () -> {
            CommandLineParser.parseArgs(args);
        });
        
        assertTrue(exception.getMessage().contains("Missing value"));
    }
    
    @Test
    @DisplayName("Test parser with invalid array size format")
    void testParseWithInvalidArraySizes() {
        String[] args = {"-s", "10,abc,1000"};
        
        Exception exception = assertThrows(IllegalArgumentException.class, () -> {
            CommandLineParser.parseArgs(args);
        });
        
        assertTrue(exception.getMessage().contains("Invalid array size"));
    }
    
    @Test
    @DisplayName("Test parser with min greater than max")
    void testParseWithMinGreaterThanMax() {
        String[] args = {"-min", "100", "-max", "50"};
        
        Exception exception = assertThrows(IllegalArgumentException.class, () -> {
            CommandLineParser.parseArgs(args);
        });
        
        assertTrue(exception.getMessage().contains("Min value must be less than max value"));
    }
}