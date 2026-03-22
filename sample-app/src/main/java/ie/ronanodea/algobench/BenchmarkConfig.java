package ie.ronanodea.algobench;

public class BenchmarkConfig {
    private final int[] arraySizes;
    private final int repetitions;
    private final int minValue;
    private final int maxValue;

    public BenchmarkConfig(int[] arraySizes, int repetitions, int minValue, int maxValue) {
        this.arraySizes = arraySizes;
        this.repetitions = repetitions;
        this.minValue = minValue;
        this.maxValue = maxValue;
    }

    public int[] getArraySizes() {
        return arraySizes;
    }

    public int getRepetitions() {
        return repetitions;
    }

    public int getMinValue() {
        return minValue;
    }

    public int getMaxValue() {
        return maxValue;
    }

    // Factory method for default configuration
    public static BenchmarkConfig getDefault() {
        return new BenchmarkConfig(
            new int[]{10, 100, 500, 1000, 2000, 3000, 5000, 10000, 15000, 20000},
            10, // repetitions
            0,  // default minimum value
            100 // default maximum value
        );
    }

    // Builder pattern for custom configurations
    public static class Builder {
        private int[] arraySizes;
        private int repetitions = 10;
        private int minValue = 0;
        private int maxValue = 100;

        public Builder arraySizes(int[] sizes) {
            this.arraySizes = sizes;
            return this;
        }

        public Builder repetitions(int reps) {
            this.repetitions = reps;
            return this;
        }

        public Builder randomRange(int min, int max) {
            this.minValue = min;
            this.maxValue = max;
            return this;
        }

        public BenchmarkConfig build() {
            if (arraySizes == null) {
                arraySizes = new int[]{10, 100, 500, 1000, 2000, 3000, 5000, 10000, 12000, 15000};
            }
            return new BenchmarkConfig(arraySizes, repetitions, minValue, maxValue);
        }
    }
}