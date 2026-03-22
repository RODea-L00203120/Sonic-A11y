package ie.ronanodea.algobench;


import java.util.concurrent.ThreadLocalRandom;
import java.util.function.Consumer;

public class Benchmarker {
    private static final int WARM_UP_ITERATIONS = 5;
  



    private static int[] randomArray(int size, int min, int max) {
        int[] randArr = new int[size];
        for (int i = 0; i < randArr.length; i++) {
            int boundedRandomValue = ThreadLocalRandom.current().nextInt(min, max);
            randArr[i] = boundedRandomValue;
        }
        return randArr;
    }

    private int[] copyArr(int[] src) {
        int[] dest = new int[src.length];
        System.arraycopy(src, 0, dest, 0, src.length);
        return dest;
    }

    private void performWarmup(int size, Consumer<int[]> sortingMethod, int minValue, int maxValue) {
        int[] warmupArray = randomArray(size, minValue, maxValue);
        for (int i = 0; i < WARM_UP_ITERATIONS; i++) {
            int[] cloned = copyArr(warmupArray);
            sortingMethod.accept(cloned);
        }
    }

    public double benchmarkWallTime(int reps, int size, Consumer<int[]> sortingMethod, int minValue, int maxValue) {
        performWarmup(size, sortingMethod, minValue, maxValue);
        
        double totalWallTime = 0;
        int[] arr = randomArray(size, minValue, maxValue);
        
        for (int i = 0; i < reps; i++) {
            int[] cloned = copyArr(arr);
            
            long startWallTime = System.nanoTime();
            sortingMethod.accept(cloned);
            long endWallTime = System.nanoTime();
            
            double wallTimeMs = (endWallTime - startWallTime) / 1_000_000.0;
            totalWallTime += wallTimeMs;
        }
        
        return totalWallTime / reps;
    }

}