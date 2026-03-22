package ie.ronanodea.algobench;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import java.util.Arrays;
import java.util.Random;

import static org.junit.jupiter.api.Assertions.*;

class BucketSortTest {

    @Test
    @DisplayName("Test BucketSort with already sorted array")
    void testBucketSortWithSortedArray() {
        int[] arr = {1, 2, 3, 4, 5};
        int[] expected = {1, 2, 3, 4, 5};
        
        BucketSort.bucketSort(arr);
        
        assertArrayEquals(expected, arr);
    }
    
    @Test
    @DisplayName("Test BucketSort with reverse sorted array")
    void testBucketSortWithReverseSortedArray() {
        int[] arr = {5, 4, 3, 2, 1};
        int[] expected = {1, 2, 3, 4, 5};
        
        BucketSort.bucketSort(arr);
        
        assertArrayEquals(expected, arr);
    }
    
    @Test
    @DisplayName("Test BucketSort with random array")
    void testBucketSortWithRandomArray() {
        int[] arr = {3, 1, 4, 1, 5, 9, 2, 6, 5};
        int[] expected = Arrays.copyOf(arr, arr.length);
        Arrays.sort(expected);
        
        BucketSort.bucketSort(arr);
        
        assertArrayEquals(expected, arr);
    }
    
    @Test
    @DisplayName("Test BucketSort with empty array")
    void testBucketSortWithEmptyArray() {
        int[] arr = {};
        int[] expected = {};
        
        BucketSort.bucketSort(arr);
        
        assertArrayEquals(expected, arr);
    }
    
    @Test
    @DisplayName("Test BucketSort with single element array")
    void testBucketSortWithSingleElementArray() {
        int[] arr = {42};
        int[] expected = {42};
        
        BucketSort.bucketSort(arr);
        
        assertArrayEquals(expected, arr);
    }
    
    @Test
    @DisplayName("Test BucketSort with array containing duplicates")
    void testBucketSortWithDuplicates() {
        int[] arr = {3, 1, 4, 1, 5, 9, 2, 6, 5};
        int[] expected = {1, 1, 2, 3, 4, 5, 5, 6, 9};
        
        BucketSort.bucketSort(arr);
        
        assertArrayEquals(expected, arr);
    }
    
    @Test
    @DisplayName("Test BucketSort with large random array")
    void testBucketSortWithLargeRandomArray() {
        Random rand = new Random(42); // Use a fixed seed for reproducibility
        int[] arr = new int[100];
        for (int i = 0; i < arr.length; i++) {
            arr[i] = rand.nextInt(1000);
        }
        
        int[] expected = Arrays.copyOf(arr, arr.length);
        Arrays.sort(expected);
        
        BucketSort.bucketSort(arr);
        
        assertArrayEquals(expected, arr);
    }
    
    @Test
    @DisplayName("Test BucketSort with negative numbers")
    void testBucketSortWithNegativeNumbers() {
        int[] arr = {-3, -1, -4, 1, 5, -9, 2, 6, -5};
        int[] expected = Arrays.copyOf(arr, arr.length);
        Arrays.sort(expected);
        
        BucketSort.bucketSort(arr);
        
        assertArrayEquals(expected, arr);
    }
    
    @Test
    @DisplayName("Test BucketSort with all same value")
    void testBucketSortWithAllSameValue() {
        int[] arr = {5, 5, 5, 5, 5};
        int[] expected = {5, 5, 5, 5, 5};
        
        BucketSort.bucketSort(arr);
        
        assertArrayEquals(expected, arr);
    }
}