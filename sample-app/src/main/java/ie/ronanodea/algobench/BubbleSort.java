package ie.ronanodea.algobench;

// named for the way in which one can visualise the largest element bubbling up to the end of the array.
// interesting source shows both visualisation and sonification of bubble sort.
// https://www.youtube.com/watch?v=Cq7SMsQBEUw&list=PLZh3kxyHrVp_AcOanN_jpuQbcMVdXbqei&index=7
// https://github.com/bingmann/sound-of-sorting


public class BubbleSort {
    // public access to other classes I.E BenchMarker and Runner
    public static void bubbleSort(int[] arr) { // input array passed to method
        int n = arr.length; // n equal to the length of the input array
        boolean  swappedElement = true; // indicates that a swap occurs during previous iteration through array

        while (swappedElement) { // continues as long as swappedElement Boolean is true
            swappedElement = false; // set swapped to false if no swap occurs it remains false finishing the loop
            for (int i = 0; i < n - 1; i++) { // Outer loop for passes
                // for (int j = 0; j < n - i - 1; j++) {  // Inner loop for comparisons - redundant causes multiple passes
                if (arr[i] > arr[i + 1]) { // if current element is greater than next:
                    // when you want to swap to elements of an array use a temp value.
                    // Otherwise, you lose original value at i pos
                    swappedElement = true;
                    // temp variable for current value at index j
                    int temp = arr[i];

                    arr[i] = arr[i + 1];
                    arr[i + 1] = temp;
                }
            }
         n--; // reduce the number of element to check - largest has already bubbled up - slight optimisation
        }
    }
}



