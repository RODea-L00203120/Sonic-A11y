package ie.ronanodea.algobench;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import java.util.Arrays;
import java.util.Random;

import static org.junit.jupiter.api.Assertions.*;

class BubbleSortTest {

    @Test
    @DisplayName("Test BubbleSort with already sorted array")
    void testBubbleSortWithSortedArray() {
        int[] arr = {1, 2, 3, 4, 5};
        int[] expected = {1, 2, 3, 4, 5};
        
        BubbleSort.bubbleSort(arr);
        
        assertArrayEquals(expected, arr);
    }
    
    @Test
    @DisplayName("Test BubbleSort with reverse sorted array")
    void testBubbleSortWithReverseSortedArray() {
        int[] arr = {5, 4, 3, 2, 1};
        int[] expected = {1, 2, 3, 4, 5};
        
        BubbleSort.bubbleSort(arr);
        
        assertArrayEquals(expected, arr);
    }
    
    @Test
    @DisplayName("Test BubbleSort with random array")
    void testBubbleSortWithRandomArray() {
        int[] arr = {3, 1, 4, 1, 5, 9, 2, 6, 5};
        int[] expected = Arrays.copyOf(arr, arr.length);
        Arrays.sort(expected);
        
        BubbleSort.bubbleSort(arr);
        
        assertArrayEquals(expected, arr);
    }
    
    @Test
    @DisplayName("Test BubbleSort with empty array")
    void testBubbleSortWithEmptyArray() {
        int[] arr = {};
        int[] expected = {};
        
        BubbleSort.bubbleSort(arr);
        
        assertArrayEquals(expected, arr);
    }
    
    @Test
    @DisplayName("Test BubbleSort with single element array")
    void testBubbleSortWithSingleElementArray() {
        int[] arr = {42};
        int[] expected = {42};
        
        BubbleSort.bubbleSort(arr);
        
        assertArrayEquals(expected, arr);
    }
    
    @Test
    @DisplayName("Test BubbleSort with array containing duplicates")
    void testBubbleSortWithDuplicates() {
        int[] arr = {3, 1, 4, 1, 5, 9, 2, 6, 5};
        int[] expected = {1, 1, 2, 3, 4, 5, 5, 6, 9};
        
        BubbleSort.bubbleSort(arr);
        
        assertArrayEquals(expected, arr);
    }
    
    @Test
    @DisplayName("Test BubbleSort with large random array")
    void testBubbleSortWithLargeRandomArray() {
        Random rand = new Random(42); // Use a fixed seed for reproducibility
        int[] arr = new int[100];
        for (int i = 0; i < arr.length; i++) {
            arr[i] = rand.nextInt(1000);
        }
        
        int[] expected = Arrays.copyOf(arr, arr.length);
        Arrays.sort(expected);
        
        BubbleSort.bubbleSort(arr);
        
        assertArrayEquals(expected, arr);
    }
}