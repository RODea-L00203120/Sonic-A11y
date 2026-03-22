package ie.ronanodea.algobench;
// adapted from following along at: https://www.youtube.com/watch?v=dsqsnngsoD8
// Note the developer did not make the source code directly available.
// This code has been altered to fit within the multiple class structure for my project submission
// comments relating to my own understanding added throughout

// multimodal demonstration of selection sort available here: https://www.youtube.com/watch?v=92BfuxHn2XE
// great comment in there summing upo selection sort: Selection sort: find lowest item, put, and repeat.

// further reading : https://www.geeksforgeeks.org/selection-sort/

public class SelectionSort {
    // public again
    public static void selectionSort(int[] inputArray){
        // variable to store input array length
        int length = inputArray.length;
        // don't iterate to final position as no comparison with an element
        // to right can be made this is pos len-2 inclusive (<) not (<=)
        for(int i = 0; i < length -1; i++){
            // set current min to value at index
            int min = inputArray[i];
            // track the index of the current min
            int indexOfMin = i;
            // iterates up to len - 1 i.e. last element
            for(int j = i + 1; j < length; j++){
                // if value at j is less that current min set min
                // and index of min to value at j and index j respectively
                if(inputArray[j] < min){
                    min = inputArray[j];
                    indexOfMin = j;
                }
            }

            // with the index of min found we can swap the value and index i with the minimum value
            swap(inputArray, i, indexOfMin);
        }
    }

    // helper method that stores value at index i in temp var,
    // sets the index i to the minimum value and then moves the original value of array at i to the previous index of
    // the minimum value
    private static void swap(int[] inputArray, int a, int b) {
        int temp = inputArray[a];
        inputArray[a] = inputArray[b];
        inputArray[b] = temp;
    }
}


