package ie.ronanodea.algobench;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import java.util.Arrays;
import java.util.Random;

import static org.junit.jupiter.api.Assertions.*;

class MergeSortTest {

    @Test
    @DisplayName("Test MergeSort with already sorted array")
    void testMergeSortWithSortedArray() {
        int[] arr = {1, 2, 3, 4, 5};
        int[] expected = {1, 2, 3, 4, 5};
        
        MergeSort.mergeSort(arr);
        
        assertArrayEquals(expected, arr);
    }
    
    @Test
    @DisplayName("Test MergeSort with reverse sorted array")
    void testMergeSortWithReverseSortedArray() {
        int[] arr = {5, 4, 3, 2, 1};
        int[] expected = {1, 2, 3, 4, 5};
        
        MergeSort.mergeSort(arr);
        
        assertArrayEquals(expected, arr);
    }
    
    @Test
    @DisplayName("Test MergeSort with random array")
    void testMergeSortWithRandomArray() {
        int[] arr = {3, 1, 4, 1, 5, 9, 2, 6, 5};
        int[] expected = Arrays.copyOf(arr, arr.length);
        Arrays.sort(expected);
        
        MergeSort.mergeSort(arr);
        
        assertArrayEquals(expected, arr);
    }
    
    @Test
    @DisplayName("Test MergeSort with empty array")
    void testMergeSortWithEmptyArray() {
        int[] arr = {};
        int[] expected = {};
        
        MergeSort.mergeSort(arr);
        
        assertArrayEquals(expected, arr);
    }
    
    @Test
    @DisplayName("Test MergeSort with single element array")
    void testMergeSortWithSingleElementArray() {
        int[] arr = {42};
        int[] expected = {42};
        
        MergeSort.mergeSort(arr);
        
        assertArrayEquals(expected, arr);
    }
    
    @Test
    @DisplayName("Test MergeSort with array containing duplicates")
    void testMergeSortWithDuplicates() {
        int[] arr = {3, 1, 4, 1, 5, 9, 2, 6, 5};
        int[] expected = {1, 1, 2, 3, 4, 5, 5, 6, 9};
        
        MergeSort.mergeSort(arr);
        
        assertArrayEquals(expected, arr);
    }
    
    @Test
    @DisplayName("Test MergeSort with large random array")
    void testMergeSortWithLargeRandomArray() {
        Random rand = new Random(42); // Use a fixed seed for reproducibility
        int[] arr = new int[100];
        for (int i = 0; i < arr.length; i++) {
            arr[i] = rand.nextInt(1000);
        }
        
        int[] expected = Arrays.copyOf(arr, arr.length);
        Arrays.sort(expected);
        
        MergeSort.mergeSort(arr);
        
        assertArrayEquals(expected, arr);
    }
}