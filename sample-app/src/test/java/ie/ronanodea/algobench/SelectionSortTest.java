package ie.ronanodea.algobench;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import java.util.Arrays;
import java.util.Random;

import static org.junit.jupiter.api.Assertions.*;

class SelectionSortTest {

    @Test
    @DisplayName("Test SelectionSort with already sorted array")
    void testSelectionSortWithSortedArray() {
        int[] arr = {1, 2, 3, 4, 5};
        int[] expected = {1, 2, 3, 4, 5};
        
        SelectionSort.selectionSort(arr);
        
        assertArrayEquals(expected, arr);
    }
    
    @Test
    @DisplayName("Test SelectionSort with reverse sorted array")
    void testSelectionSortWithReverseSortedArray() {
        int[] arr = {5, 4, 3, 2, 1};
        int[] expected = {1, 2, 3, 4, 5};
        
        SelectionSort.selectionSort(arr);
        
        assertArrayEquals(expected, arr);
    }
    
    @Test
    @DisplayName("Test SelectionSort with random array")
    void testSelectionSortWithRandomArray() {
        int[] arr = {3, 1, 4, 1, 5, 9, 2, 6, 5};
        int[] expected = Arrays.copyOf(arr, arr.length);
        Arrays.sort(expected);
        
        SelectionSort.selectionSort(arr);
        
        assertArrayEquals(expected, arr);
    }
    
    @Test
    @DisplayName("Test SelectionSort with empty array")
    void testSelectionSortWithEmptyArray() {
        int[] arr = {};
        int[] expected = {};
        
        SelectionSort.selectionSort(arr);
        
        assertArrayEquals(expected, arr);
    }
    
    @Test
    @DisplayName("Test SelectionSort with single element array")
    void testSelectionSortWithSingleElementArray() {
        int[] arr = {42};
        int[] expected = {42};
        
        SelectionSort.selectionSort(arr);
        
        assertArrayEquals(expected, arr);
    }
    
    @Test
    @DisplayName("Test SelectionSort with array containing duplicates")
    void testSelectionSortWithDuplicates() {
        int[] arr = {3, 1, 4, 1, 5, 9, 2, 6, 5};
        int[] expected = {1, 1, 2, 3, 4, 5, 5, 6, 9};
        
        SelectionSort.selectionSort(arr);
        
        assertArrayEquals(expected, arr);
    }
    
    @Test
    @DisplayName("Test SelectionSort with large random array")
    void testSelectionSortWithLargeRandomArray() {
        Random rand = new Random(42); // Use a fixed seed for reproducibility
        int[] arr = new int[100];
        for (int i = 0; i < arr.length; i++) {
            arr[i] = rand.nextInt(1000);
        }
        
        int[] expected = Arrays.copyOf(arr, arr.length);
        Arrays.sort(expected);
        
        SelectionSort.selectionSort(arr);
        
        assertArrayEquals(expected, arr);
    }
}