package ie.ronanodea.algobench;

// Sourced and adapted from https://www.codepile.net/pile/ydJRPXd2, explanation/follow along by original author available here:
// https://www.youtube.com/watch?v=0lOnnd50cGI

// multimodal demo here: https://www.youtube.com/watch?v=8oJS1BMKE64
// Again great comment: "Insertion Sort: Move item left until you find the correct place. Repeat until end of list."

// further reading : https://www.khanacademy.org/computing/computer-science/algorithms/insertion-sort/a/insertion-sort
//                      https://www.geeksforgeeks.org/insertion-sort/

// This insertion algo is used to sort buckets in the included bucket algo.

// public as per usual in this program
public class InsertionSort {
    // accepts input array from benchmark class.
    public static void insertionSort(int[] arr){
        // first element is already sorted, a single element is sorted by default. We need to iterate from index 1
        for (int i = 1; i < arr.length ; i++) {
            // current value to be inserted into the sorted array
            int currentValue = arr[i];
            // intialize j to element before i, ie j is last element sorted
            int j = i - 1;
            // shift sorted elements (j and j-- elements while > 0) to the right of current value if they're greater than
            // current value. Essentially moving current value to the left until it is in its correct position.
            while(j >= 0 && arr[j] > currentValue){
                arr[j+1] = arr[j];
                j--;
            }

            // once j is < current value the while loop exits then j+1 is set to the current value
            arr[j+1] = currentValue;

            // process repeats until array is sorted.
        }

    }

}
