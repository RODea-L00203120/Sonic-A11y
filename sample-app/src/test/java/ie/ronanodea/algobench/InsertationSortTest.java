package ie.ronanodea.algobench;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import java.util.Arrays;
import java.util.Random;

import static org.junit.jupiter.api.Assertions.*;

class InsertionSortTest {

    @Test
    @DisplayName("Test InsertionSort with already sorted array")
    void testInsertionSortWithSortedArray() {
        int[] arr = {1, 2, 3, 4, 5};
        int[] expected = {1, 2, 3, 4, 5};
        
        InsertionSort.insertionSort(arr);
        
        assertArrayEquals(expected, arr);
    }
    
    @Test
    @DisplayName("Test InsertionSort with reverse sorted array")
    void testInsertionSortWithReverseSortedArray() {
        int[] arr = {5, 4, 3, 2, 1};
        int[] expected = {1, 2, 3, 4, 5};
        
        InsertionSort.insertionSort(arr);
        
        assertArrayEquals(expected, arr);
    }
    
    @Test
    @DisplayName("Test InsertionSort with random array")
    void testInsertionSortWithRandomArray() {
        int[] arr = {3, 1, 4, 1, 5, 9, 2, 6, 5};
        int[] expected = Arrays.copyOf(arr, arr.length);
        Arrays.sort(expected);
        
        InsertionSort.insertionSort(arr);
        
        assertArrayEquals(expected, arr);
    }
    
    @Test
    @DisplayName("Test InsertionSort with empty array")
    void testInsertionSortWithEmptyArray() {
        int[] arr = {};
        int[] expected = {};
        
        InsertionSort.insertionSort(arr);
        
        assertArrayEquals(expected, arr);
    }
    
    @Test
    @DisplayName("Test InsertionSort with single element array")
    void testInsertionSortWithSingleElementArray() {
        int[] arr = {42};
        int[] expected = {42};
        
        InsertionSort.insertionSort(arr);
        
        assertArrayEquals(expected, arr);
    }
    
    @Test
    @DisplayName("Test InsertionSort with array containing duplicates")
    void testInsertionSortWithDuplicates() {
        int[] arr = {3, 1, 4, 1, 5, 9, 2, 6, 5};
        int[] expected = {1, 1, 2, 3, 4, 5, 5, 6, 9};
        
        InsertionSort.insertionSort(arr);
        
        assertArrayEquals(expected, arr);
    }
    
    @Test
    @DisplayName("Test InsertionSort with large random array")
    void testInsertionSortWithLargeRandomArray() {
        Random rand = new Random(42); // Use a fixed seed for reproducibility
        int[] arr = new int[100];
        for (int i = 0; i < arr.length; i++) {
            arr[i] = rand.nextInt(1000);
        }
        
        int[] expected = Arrays.copyOf(arr, arr.length);
        Arrays.sort(expected);
        
        InsertionSort.insertionSort(arr);
        
        assertArrayEquals(expected, arr);
    }
}