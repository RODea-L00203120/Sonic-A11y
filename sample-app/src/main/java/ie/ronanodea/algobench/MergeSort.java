package ie.ronanodea.algobench;

// MM demonstration: https://www.youtube.com/watch?v=ZRPoEKHXTJg by Timo Bingmann
// Original Code source: https://www.codepile.net/pile/n627owzd
// My understanding is outlined below and the code in integrated into my own benchmarking project
// further reading: https://www.khanacademy.org/computing/computer-science/algorithms/merge-sort/a/overview-of-merge-sort
                    // https://www.geeksforgeeks.org/merge-sort/f

// usual  class set up
public class MergeSort {
    public static void mergeSort(int[] inputArray) {
        int inputLength = inputArray.length;
        // if the incoming array is less than 2 elements (0 or 1) it is sorted
        if(inputLength < 2){
            return;
        }
        // divide the array into 2 arrays split at midpoint
        int midIndex = inputLength / 2;
        int[] leftHalf = new int[midIndex];
        // accounts for odd-length arrays: for an array of length 9,
        // left array length is 4 (floor of 9/2), right array length is 5 (9 - 4)
        int[] rightHalf = new int[inputLength-midIndex];
        // fill left array
        for(int i = 0; i < midIndex; i++) {
            leftHalf[i] = inputArray[i];
        }
        // fill right array
        for(int i = midIndex; i < inputLength; i++) {
            rightHalf[i- midIndex] = inputArray[i];
        }

        // recursive call divide until array lengths of 1 or 0 reached
        mergeSort(leftHalf);
        mergeSort(rightHalf);

        // this is where the merge occurs the sorted sub arrays are merged back into main array
        merge(inputArray, leftHalf, rightHalf); // merge method call
    }

    private static void merge(int[] inputArray, int[] leftHalf, int[] rightHalf) {
        // len of left/right half arrays
        int leftSize = leftHalf.length;
        int rightSize = rightHalf.length;

        // i to track position in leftHalf, j for rightHalf and k for inputArray
        int i = 0, j = 0, k = 0;


        // iterates until one half of the array is cycled through
        while (i < leftSize && j < rightSize) {
            // if the element in left is less than or equal to the element from the right
            // insert it into original array at pos k
            if (leftHalf[i] <= rightHalf[j]) {
                inputArray[k] = leftHalf[i];
                i++;
            // otherwise insert val of element from right half into input array
            } else {
                inputArray[k] = rightHalf[j];
                j++;
            }
            k++;
        }
        // anything left over back into array
        while (i < leftSize) {
            inputArray[k] = leftHalf[i];
            i++;
            k++;
        }
        // anything left over back into array
        while (j < rightSize) {
            inputArray[k] = rightHalf[j];
            j++;
            k++;
        }
    }
}


// operates by recursively splitting and merging the array
